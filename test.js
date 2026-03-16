import fs from "fs";
const key = process.env.GEMINI_API_KEY;
fs.writeFileSync("key.txt", key ? key.substring(0, 5) + "..." : "undefined");
