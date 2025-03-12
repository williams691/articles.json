const fs = require("fs");
const { execSync } = require("child_process");

const outputPath = "output.json"; // File hasil scrape
const githubJsonPath = "articles.json"; // File JSON di repo GitHub

// Baca data dari output.json
const newData = JSON.parse(fs.readFileSync(outputPath, "utf8"));

// Update articles.json
fs.writeFileSync(githubJsonPath, JSON.stringify(newData, null, 2));

console.log("✅ Artikel berhasil di-update!");

// Commit & push ke GitHub
try {
  execSync(`git add ${githubJsonPath}`);
  execSync(`git commit -m "Update articles.json from output.json"`);
  execSync(`git push origin main`);
  console.log("🚀 Artikel berhasil di-push ke GitHub!");
} catch (err) {
  console.error("❌ Gagal push ke GitHub:", err.message);
}
