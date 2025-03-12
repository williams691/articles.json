const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const lmdb = require("lmdb");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function scrapeQuora(keyword, duration) {
    console.log("🚀 Memulai scraping Quora...");

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const cookiesFilePath = path.join(__dirname, "cookies.json");
    if (fs.existsSync(cookiesFilePath)) {
        const cookiesString = fs.readFileSync(cookiesFilePath);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log("✅ Cookies telah dimuat.");
    } else {
        console.log("⚠️ File cookies.json tidak ditemukan!");
    }

    const searchUrl = `https://www.quora.com/search?q=${encodeURIComponent(keyword)}&type=question`;

    const startTime = Date.now();

    while (Date.now() - startTime < duration * 1000) {
        await page.goto(searchUrl, { waitUntil: "networkidle2" });
        console.log("🔍 Scraping halaman...");

        async function autoScroll(page) {
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                console.log(`🔄 Scroll ke-${i + 1} selesai...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        await autoScroll(page);
        await new Promise(r => setTimeout(r, 2000));

        const questions = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("div.puppeteer_test_question_title"))
                .map((el) => el.innerText.trim())
                .filter((text) => text.length > 10);
        });

        console.log(`✅ Ditemukan ${questions.length} pertanyaan.`);

        const dbPath = path.join(__dirname, "quora.lmdb");
        const db = lmdb.open({ path: dbPath });
        
        questions.forEach((q, index) => {
            const key = `${keyword}-${Date.now()}-${index}`;
            db.put(key, { keyword, question: q });
        });

        console.log("📂 Data tersimpan ke LMDB.");
        db.close();

        const cookies = await page.cookies();
        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
        console.log("✅ Cookies diperbarui.");

        console.log("⏳ Menunggu 10 detik sebelum scraping lagi...");
        await new Promise(r => setTimeout(r, 10000));
    }

    await browser.close();
    console.log("🚀 Scraping selesai sesuai durasi!");
}

rl.question("Masukkan keyword pencarian: ", (keyword) => {
    rl.question("Masukkan durasi scraping (dalam detik): ", (duration) => {
        scrapeQuora(keyword, parseInt(duration));
        rl.close();
    });
});
