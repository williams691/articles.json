const lmdb = require("lmdb");
const path = require("path");

const dbPath = path.join(__dirname, "quora.lmdb");
const db = lmdb.open({ path: dbPath });

console.log("📂 Membaca data dari LMDB...\n");

for (const { key, value } of db.getRange()) {
    console.log(`🔑 ${key}`);
    console.log(`❓ Pertanyaan: ${value.question || key}`);
    console.log(`🔍 Keyword: ${value.keyword || "Tidak ada keyword"}`);
    console.log("──────────────────────────────────");
}

db.close();
console.log("✅ Selesai membaca data.");
