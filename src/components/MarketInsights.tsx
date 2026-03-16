import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp, 
  MapPin, 
  ShoppingBag, 
  Zap,
  Flame,
  ChevronRight,
  Globe,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { User, Language } from '../types';
import { useTranslation } from '../translations';
import { ProductCard } from './ProductCard';

const categories = [
  { id: 'pottery', name: 'Pottery', icon: '🏺' },
  { id: 'botanical', name: 'Botanical Crafts', icon: '🌿' },
  { id: 'paper', name: 'Paper Crafts', icon: '📄' },
  { id: 'clothes', name: 'Handmade Clothes', icon: '👕' },
];

const categoryData: Record<string, any> = {
  pottery: {
    title: "Pottery Market Revenue Growth",
    unit: "M",
    growth: [
      { year: '2021', revenue: 520 },
      { year: '2022', revenue: 580 },
      { year: '2023', revenue: 640 },
      { year: '2024', revenue: 710 },
    ],
    popularProducts: [
      { name: 'Terracotta Water Pot', description: 'Traditional cooling water storage', sales: 450, demand: 'High', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=200&h=200', color: '#f97316' },
      { name: 'Clay Diyas', description: 'Handcrafted festive oil lamps', sales: 320, demand: 'Medium', image: 'https://images.unsplash.com/photo-1605469237565-17d121175608?auto=format&fit=crop&q=80&w=200&h=200', color: '#fb923c' },
      { name: 'Decorative Ceramic Vase', description: 'Modern glazed interior decor', sales: 280, demand: 'Medium', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=200&h=200', color: '#fdba74' },
      { name: 'Garden Planters', description: 'Durable outdoor plant pots', sales: 150, demand: 'Low', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200&h=200', color: '#fed7aa' },
    ],
    regionalDemand: [
      { name: 'North India', value: 40 },
      { name: 'South India', value: 25 },
      { name: 'West India', value: 20 },
      { name: 'East India', value: 15 },
    ],
    advisory: "Recent market trends show strong growth in eco-friendly pottery products, with increasing demand in urban home décor markets. Artisans should focus on sustainable materials and modern decorative designs to increase global appeal."
  },
  botanical: {
    title: "Botanical Crafts Revenue Growth",
    unit: "M",
    growth: [
      { year: '2021', revenue: 310 },
      { year: '2022', revenue: 355 },
      { year: '2023', revenue: 420 },
      { year: '2024', revenue: 480 },
    ],
    popularProducts: [
      { name: 'Bamboo Storage Basket', description: 'Woven natural storage solution', sales: 520, demand: 'High', image: 'https://images.unsplash.com/photo-1590725140246-20acdbfa7875?auto=format&fit=crop&q=80&w=200&h=200', color: '#10b981' },
      { name: 'Jute Tote Bags', description: 'Eco-friendly shopping bags', sales: 410, demand: 'High', image: 'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&q=80&w=200&h=200', color: '#34d399' },
      { name: 'Natural Dyed Fabric', description: 'Plant-based color textiles', sales: 350, demand: 'Medium', image: 'https://images.unsplash.com/photo-1528318269466-69d9324cb21b?auto=format&fit=crop&q=80&w=200&h=200', color: '#6ee7b7' },
      { name: 'Leaf Art Wall Decor', description: 'Preserved botanical artwork', sales: 210, demand: 'Low', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=200&h=200', color: '#a7f3d0' },
    ],
    regionalDemand: [
      { name: 'Northeast India', value: 33 },
      { name: 'South India', value: 22 },
      { name: 'East India', value: 18 },
      { name: 'Tamil Nadu Region', value: 15 },
      { name: 'Other', value: 12 },
    ],
    advisory: "Eco-friendly botanical crafts such as bamboo and jute products are gaining popularity globally due to sustainability trends."
  },
  paper: {
    title: "Paper Crafts Revenue Growth",
    unit: "M",
    growth: [
      { year: '2021', revenue: 210 },
      { year: '2022', revenue: 240 },
      { year: '2023', revenue: 270 },
      { year: '2024', revenue: 310 },
    ],
    popularProducts: [
      { name: 'Handmade Greeting Cards', description: 'Artisanal paper cards', sales: 380, demand: 'High', image: 'https://images.unsplash.com/photo-1583089892943-e02e52f17d50?auto=format&fit=crop&q=80&w=200&h=200', color: '#06b6d4' },
      { name: 'Decorative Paper Lanterns', description: 'Origami style lighting', sales: 310, demand: 'Medium', image: 'https://images.unsplash.com/photo-1512413914583-1748cb1ee35b?auto=format&fit=crop&q=80&w=200&h=200', color: '#22d3ee' },
      { name: 'Handmade Notebooks', description: 'Recycled paper journals', sales: 250, demand: 'Medium', image: 'https://images.unsplash.com/photo-1531346878377-a541e4ab04ce?auto=format&fit=crop&q=80&w=200&h=200', color: '#67e8f9' },
      { name: 'Paper Wall Hangings', description: 'Intricate cut-out decor', sales: 180, demand: 'Low', image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=200&h=200', color: '#a5f3fc' },
    ],
    regionalDemand: [
      { name: 'East India', value: 30 },
      { name: 'North India', value: 22 },
      { name: 'West India', value: 16 },
      { name: 'Central India', value: 15 },
      { name: 'Other', value: 17 },
    ],
    advisory: "Demand for sustainable paper products is rising due to eco-conscious consumers. Handmade notebooks and decorative paper products have strong growth potential."
  },
  clothes: {
    title: "Handmade Textile Market Growth",
    unit: "B",
    growth: [
      { year: '2021', revenue: 1.3 },
      { year: '2022', revenue: 1.45 },
      { year: '2023', revenue: 1.62 },
      { year: '2024', revenue: 1.8 },
    ],
    popularProducts: [
      { name: 'Handloom Sarees', description: 'Traditional woven silk/cotton', sales: 650, demand: 'High', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200&h=200', color: '#8b5cf6' },
      { name: 'Block Print Kurtas', description: 'Hand-stamped cotton wear', sales: 520, demand: 'High', image: 'https://images.unsplash.com/photo-1583391733958-d15f110881f4?auto=format&fit=crop&q=80&w=200&h=200', color: '#a78bfa' },
      { name: 'Embroidered Shawls', description: 'Intricate threadwork wraps', sales: 410, demand: 'Medium', image: 'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&q=80&w=200&h=200', color: '#c4b5fd' },
      { name: 'Tie-Dye Garments', description: 'Colorful patterned clothing', sales: 320, demand: 'Medium', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=200&h=200', color: '#ddd6fe' },
    ],
    regionalDemand: [
      { name: 'West India', value: 26 },
      { name: 'East India', value: 21 },
      { name: 'South India', value: 18 },
      { name: 'North India', value: 15 },
      { name: 'Other Regions', value: 20 },
    ],
    advisory: "Handloom and handmade textile products are seeing strong international demand. Artisans should emphasize traditional weaving techniques and natural dyes to attract premium buyers."
  }
};

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

export const MarketInsights = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const t = useTranslation(user.language || Language.ENGLISH);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);

  const currentData = categoryData[selectedCategory] || categoryData.pottery;

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Market Insights</h2>
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Global Craft Trends</p>
        </div>
      </header>

      {/* Category Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center gap-2 min-w-[100px] p-4 rounded-2xl border transition-all ${
              selectedCategory === cat.id 
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-white/20'
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Popular Products List */}
        <motion.div 
          key={`popular-${selectedCategory}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Popular Products</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {currentData.popularProducts.map((product: any, index: number) => (
              <ProductCard
                key={index}
                image={product.image}
                name={product.name}
                description={product.description}
                sales={product.sales}
                demand={product.demand}
              />
            ))}
          </div>
        </motion.div>

        {/* Revenue Growth Chart */}
        <motion.div 
          key={`growth-${selectedCategory}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{currentData.title}</h3>
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickFormatter={(value) => `$${value}${currentData.unit}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--nav-bg)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Regional Demand Distribution */}
        <motion.div 
          key={`regional-${selectedCategory}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Regional Demand Distribution</h3>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Globe size={16} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData.regionalDemand}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {currentData.regionalDemand.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--nav-bg)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {currentData.regionalDemand.map((region: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-medium text-[var(--text-primary)]">{region.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{region.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Section */}
      <section className="card p-6 space-y-4 border-cyan-500/30 bg-cyan-500/5">
        <div className="flex items-center gap-2 text-cyan-400">
          <Zap size={18} />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Neural Advisory</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {currentData.advisory}
        </p>
      </section>
    </div>
  );
};
