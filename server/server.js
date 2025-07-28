const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// middleware
app.use(cors());  // React'tan gelen istekleri kabul et. Farklı portların birbirleriye iletişim kurmasını sağlar cors.
app.use(express.json());  // JSON body parser. !!! express.json()'dan sonra parantezi unutma!!!

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Kanban Backend API çalışıyor'});
});

// Server'i başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
    console.log(`Test et: http://localhost:${PORT}`);
});