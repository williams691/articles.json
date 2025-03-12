const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware untuk melayani file statis
app.use(express.static(__dirname));

// Endpoint untuk mendapatkan daftar artikel
app.get('/artikel-list', (req, res) => {
    const artikelFolder = path.join(__dirname, 'artikel');
    fs.readdir(artikelFolder, (err, files) => {
        if (err) {
            console.error('Gagal membaca folder artikel:', err);
            res.status(500).json({ error: 'Gagal memuat daftar artikel' });
        } else {
            res.json(files);
        }
    });
});

// Endpoint untuk melayani template.html di URL root (/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'template.html'));
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
