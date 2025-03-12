require("dotenv").config({ path: "./gemini.env" });
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const lmdb = require("lmdb");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

const db = lmdb.open({ path: "./quora.lmdb" });

async function getAIAnswer(question) {
    try {
        const response = await axios.post(
            GEMINI_API_URL,
            { contents: [{ parts: [{ text: question }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return answer || "Jawaban tidak ditemukan.";
    } catch (error) {
        console.error("❌ Gagal mendapatkan jawaban AI:", error.response?.data || error.message);
        return null; // Return null biar gampang filtering di bawah
    }
}

async function generateJSON() {
    const outputPath = path.join(__dirname, "output.json");
    let results = [];

    console.log("🚀 Mulai proses pembuatan JSON...");

    let count = 0;
    for (const { key, value } of db.getRange()) {
        if (count >= 5) break; // Batasi hanya 5 pertanyaan pertama
        
        console.log(`🔍 Mengambil pertanyaan (${count + 1}/5): ${value.question}`);

        const answer = await getAIAnswer(value.question);
        if (!answer) {
            console.warn(`⚠️ Melewati pertanyaan '${value.question}' karena gagal mendapatkan jawaban.`);
            continue;
        }

        results.push({
            question: value.question,
            answer: answer
        });

        count++;
    }

    if (results.length === 0) {
        console.log("⚠️ Tidak ada data yang bisa diproses.");
        return;
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
    console.log(`✅ Data berhasil disimpan di ${outputPath}`);
}

generateJSON();
