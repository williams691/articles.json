// Data artikel yang akan dimuat
const data = {
    title: "TechNews - Berita Teknologi",
    content: "Selamat datang di TechNews, portal berita teknologi terkini dan terpercaya."
};

// Fungsi untuk memuat data ke halaman
function loadContent() {
    // Masukkan judul ke tag <title>
    document.getElementById("page-title").textContent = data.title;

    // Masukkan konten ke container artikel
    const articleContainer = document.getElementById("article-container");
    articleContainer.innerHTML = `<p>${data.content}</p>`;
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", loadContent);
