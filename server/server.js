require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

// MongoDB bağlantısını başlat.
connectDB();

// middleware
// app.use(cors());  // React'tan gelen istekleri kabul et. Farklı portların birbirleriye iletişim kurmasını sağlar cors.
// app.use(express.json());  // JSON body parser. !!! express.json()'dan sonra parantezi unutma!!!

// Test route
// app.get('/', (req, res) => {});  // app.js'e taşındı.

// Server'i başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor.`);
    console.log(`Test et: http://localhost:${PORT}`);
});