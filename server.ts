import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("artisan.db");
const JWT_SECRET = process.env.JWT_SECRET || "artisan-sahayak-secret-key";

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    location TEXT,
    language TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    name TEXT,
    story TEXT,
    description TEXT,
    price REAL,
    photo_url TEXT,
    category TEXT,
    views INTEGER DEFAULT 0,
    cod_enabled INTEGER DEFAULT 1,
    location TEXT,
    stock INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bank_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    account_holder TEXT,
    bank_name TEXT,
    ifsc TEXT,
    account_number TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    content TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed Mock Data
const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    db.prepare("INSERT INTO users (username, password, location, language) VALUES (?, ?, ?, ?)").run(
      'artisan_demo', 
      hashedPassword,
      'Madhubani, Bihar', 
      'Hindi'
    );
  }

  const postCount = db.prepare("SELECT COUNT(*) as count FROM community_posts").get() as any;
  if (postCount.count === 0) {
    const demoPosts = [
      { username: 'Ramesh', content: 'Just finished my latest terracotta collection! What do you think?', image: 'https://picsum.photos/seed/post1/400/300' },
      { username: 'Sunita', content: 'The new natural dye technique is working wonders for my sarees.', image: 'https://picsum.photos/seed/post2/400/300' },
      { username: 'Abdul', content: 'Looking for a bamboo supplier in the North East. Any leads?', image: '' }
    ];
    demoPosts.forEach(p => {
      db.prepare("INSERT INTO community_posts (user_id, username, content, image_url, likes) VALUES (?, ?, ?, ?, ?)")
        .run(1, p.username, p.content, p.image, Math.floor(Math.random() * 100));
    });
  }
};
seedData();

// --- Middleware ---

const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", message: err.message });
};

// --- Schemas ---

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  location: z.string(),
  language: z.string()
});

const productSchema = z.object({
  name: z.string(),
  story: z.string(),
  description: z.string(),
  price: z.number(),
  photo_url: z.string().optional(),
  category: z.string(),
  location: z.string(),
  cod_enabled: z.boolean(),
  stock: z.number().optional()
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- Auth Routes ---

  app.get("/api/me", authenticateToken, async (req: any, res) => {
    try {
      const user: any = db.prepare("SELECT id, username, location, language FROM users WHERE id = ?").get(req.user.id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/health/gemini", (req, res) => {
    const isKeySet = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    res.json({ status: isKeySet ? "ok" : "missing_key" });
  });

  app.post("/api/signup", async (req, res, next) => {
    try {
      const { username, password, location, language } = signupSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const info = db.prepare("INSERT INTO users (username, password, location, language) VALUES (?, ?, ?, ?)").run(username, hashedPassword, location, language);
      const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET);
      
      res.json({ token, user: { id: info.lastInsertRowid, username, location, language } });
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ error: e.flatten() });
      res.status(400).json({ error: "Username already exists or invalid data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // --- Product Routes ---

  app.get("/api/products", authenticateToken, (req: any, res) => {
    const userProducts = db.prepare("SELECT * FROM products WHERE owner_id = ?").all(req.user.id);
    const demoProducts = [
      { 
        id: -1, 
        owner_id: req.user.id, 
        name: 'Rajasthani Hand-painted Metal Soldiers', 
        price: 1850, 
        category: 'Metalwork', 
        story: 'Exquisitely hand-painted metal soldiers from Rajasthan, capturing the royal guard in vibrant traditional attire.', 
        photo_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
        description: 'A set of three hand-painted metal soldiers. Each figure is meticulously detailed with traditional Rajasthani patterns and colors, representing the rich cultural heritage of the desert kingdom.',
        location: 'Rajasthan',
        views: 1420,
        cod_enabled: 1,
        stock: 5,
        is_active: 1
      },
      { 
        id: -2, 
        owner_id: req.user.id, 
        name: 'Handmade Traditional Rag Dolls', 
        price: 550, 
        category: 'Dolls', 
        story: 'Soft, colorful dolls handcrafted by women artisans using traditional embroidery and recycled fabric scraps.', 
        photo_url: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=800&q=80',
        description: 'These traditional rag dolls are more than just toys; they are pieces of art. Made with love and care, each doll features unique embroidery and vibrant fabrics, perfect for home decor or as a meaningful gift.',
        location: 'Gujarat',
        views: 980,
        cod_enabled: 1,
        stock: 12,
        is_active: 1
      }
    ];
    res.json([...demoProducts, ...userProducts.map((p: any) => ({ ...p, cod_enabled: !!p.cod_enabled, is_active: !!p.is_active }))]);
  });

  app.post("/api/products", authenticateToken, (req: any, res) => {
    try {
      const data = productSchema.parse(req.body);
      const info = db.prepare(`
        INSERT INTO products (owner_id, name, story, description, price, photo_url, category, location, cod_enabled, stock, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, data.name, data.story, data.description, data.price, data.photo_url, data.category, data.location, data.cod_enabled ? 1 : 0, data.stock || 0, 1);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.patch("/api/products/:id", authenticateToken, (req: any, res) => {
    const id = parseInt(req.params.id);
    const { stock, is_active, price } = req.body;
    
    if (id < 0) {
      return res.json({ success: true }); // Gracefully handle demo product updates
    }

    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (stock !== undefined) {
        updates.push("stock = ?");
        params.push(stock);
      }
      if (is_active !== undefined) {
        updates.push("is_active = ?");
        params.push(is_active ? 1 : 0);
      }
      if (price !== undefined) {
        updates.push("price = ?");
        params.push(price);
      }

      if (updates.length === 0) return res.status(400).json({ error: "No updates provided" });

      params.push(id, req.user.id);
      const result = db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ? AND owner_id = ?`).run(...params);
      
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Product not found or unauthorized" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, (req: any, res) => {
    const id = parseInt(req.params.id);
    if (id < 0) {
      return res.json({ success: true }); // Gracefully handle demo product "deletion"
    }
    const result = db.prepare("DELETE FROM products WHERE id = ? AND owner_id = ?").run(id, req.user.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Product not found or unauthorized" });
    }
  });

  // --- Trending Products ---
  app.get("/api/trending", (req, res) => {
    const trending = [
      { id: 101, name: "Rajasthani Soldiers", category: "Metalwork", views: 1420, price: 1850, photo_url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=400&h=300" },
      { id: 102, name: "Handmade Rag Dolls", category: "Dolls", views: 980, price: 550, photo_url: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&h=300" },
      { id: 103, name: "Handwoven Silk Saree", category: "Textiles", views: 750, price: 5000, photo_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&h=300" },
      { id: 104, name: "Brass Lamp", category: "Metalwork", views: 620, price: 1200, photo_url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&h=300" },
    ];
    res.json(trending);
  });

  // --- Bank Details ---
  app.get("/api/bank", authenticateToken, (req: any, res) => {
    const details = db.prepare("SELECT * FROM bank_details WHERE user_id = ?").get(req.user.id);
    res.json(details || null);
  });

  app.post("/api/bank", authenticateToken, (req: any, res) => {
    const { account_holder, bank_name, ifsc, account_number } = req.body;
    const existing = db.prepare("SELECT id FROM bank_details WHERE user_id = ?").get(req.user.id);
    if (existing) {
      db.prepare("UPDATE bank_details SET account_holder = ?, bank_name = ?, ifsc = ?, account_number = ? WHERE user_id = ?")
        .run(account_holder, bank_name, ifsc, account_number, req.user.id);
    } else {
      db.prepare("INSERT INTO bank_details (user_id, account_holder, bank_name, ifsc, account_number) VALUES (?, ?, ?, ?, ?)")
        .run(req.user.id, account_holder, bank_name, ifsc, account_number);
    }
    res.json({ success: true });
  });

  // --- Community Routes ---
  app.get("/api/community", authenticateToken, (req, res) => {
    const posts = db.prepare("SELECT * FROM community_posts ORDER BY timestamp DESC").all();
    res.json(posts);
  });

  app.post("/api/community/like/:id", authenticateToken, (req, res) => {
    db.prepare("UPDATE community_posts SET likes = likes + 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/community", authenticateToken, (req: any, res) => {
    const { content, image_url } = req.body;
    const info = db.prepare("INSERT INTO community_posts (user_id, username, content, image_url) VALUES (?, ?, ?, ?)")
      .run(req.user.id, req.user.username, content, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/user/language", authenticateToken, (req: any, res) => {
    const { language } = req.body;
    if (!language) return res.status(400).json({ error: "Language required" });
    db.prepare("UPDATE users SET language = ? WHERE id = ?").run(language, req.user.id);
    res.json({ success: true });
  });

  app.use(errorHandler);

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
