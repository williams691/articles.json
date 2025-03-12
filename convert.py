import os
import json
from bs4 import BeautifulSoup

# Folder tempat file HTML disimpan
ARTIKEL_FOLDER = "artikel"

def extract_content(file_path):
    """Ambil judul dan isi artikel dari file HTML"""
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Ambil judul artikel dari h1 atau title
    title = soup.find("h1")
    if not title:
        title = soup.find("title")

    question = title.get_text(strip=True) if title else "Untitled"

    # Hapus elemen navigasi, footer, script, dll.
    for tag in soup(["script", "style", "meta", "nav", "footer", "header"]):
        tag.extract()

    # Ambil isi teks utama dari artikel
    paragraphs = soup.find_all("p")
    content = "\n\n".join([p.get_text(strip=True) for p in paragraphs])

    return question, content

def convert_to_json():
    """Baca semua file HTML dan ubah jadi JSON"""
    data = []

    for idx, filename in enumerate(os.listdir(ARTIKEL_FOLDER), start=1):
        if filename.endswith(".html"):
            file_path = os.path.join(ARTIKEL_FOLDER, filename)
            question, content = extract_content(file_path)

            # Ambil 50 kata pertama untuk jawaban singkat
            answer_clean = " ".join(content.split()[:50]) + "..."

            # Kategori diambil dari nama folder atau manual mapping
            section = "General"  # Bisa dibuat mapping jika ada kategori tertentu

            data.append({
                "id": idx,
                "section": section,
                "question": question,
                "answers": [
                    {"user": "User1", "answer": answer_clean},
                    {"user": "User2", "answer": f"Artikel ini membahas: {question}"}
                ]
            })

    # Simpan ke file JSON
    with open("output.json", "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=2, ensure_ascii=False)

    print("✅ Convert selesai! File disimpan sebagai output.json")

if __name__ == "__main__":
    convert_to_json()
