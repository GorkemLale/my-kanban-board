const express = require('express');  // Web framework
const cors = require('cors');  // Cross-Origin Resource Sharing
const morgan = require('morgan');  // HTTP request logger
// const helmet = require('helmet');  // Security headers

// Kanımca buraya routes imports gelecek. strike!
const boardRoutes = require('./routes/boards');
const taskRoutes = require('./routes/tasks');


const app = express();  // Express uygulaması oluşturma

app.set('trust proxy', 1);  // !!!Döneceğim ne olduğuna!!!

app.use(express.json());  // böylesi iyi. parantez içine { limit: '10mb' } junior'a fazla
app.use(express.urlencoded({ extended: true }));  // Bu junior'a yeterli içine virgül atıp ekstra , limited: '10mb' fazla
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],  // ni dimek bunlar
    allowedHeaders: ['Content-Type', 'Authorization']
}));  // Neden gerekli? Frontend (React:3000) -> Backend (Express:5000) farklı portlarda bu yüzden CORS hatası verir.

app.use(morgan('dev'));  // bunların hepsinin routes'tan önce olması gerekiyor. yoksa çalışmazlar. app.use(morgan)'dan sonra app.use('/api/board/, boardRoutes); yapıyorsan bu dosyada tanımlılarda yani anasayfada ('/') ve bilinmeyen adresde ('*' bunu kaldırdık hata veriyordu.) çalışır.
// !!! body parsing middleware kesinlikle routes'tan önce olmalı
app.use('/api/boards', boardRoutes);  // Router'ların base url'leri ayarlandı.
app.use('/api/tasks', taskRoutes);

// // Security Middleware
// app.use(helmet());  // Ne yapar? HTTP headerlarına güvenlik ekler. 

// Cors Configuration  // Junior için cors() yeterli ama biz içini de doldurduk. 
// // Logging Middleware  // app.use(morgan('dev)); yeterli, aşağıdaki junior'a fazla gelir, Environment-based Logging
// if (process.env.NODE_ENV === 'development') {  // Ne yapar? Her HTTP isteğini console'da gösterir.
//     app.use(morgan('dev'));  // Kısa format development için, GET /api/boards 200 15ms
// } else {
//     app.use(morgan('combined'));  // Detaylı format production için, 127.0.0.1 - - [date] "GET /" 200 -
// }


// Healt Check Endpoint junior'a fazla
// app.get('/healt' (req, res) => {
//  res.status(200).json({
//      status: 'OK',
//      uptime: process.uptime(),
//      memory: process.memoryUsage(),
//      timestamp: new Date().toISOString()
//  });    
// });


// 404 handler'ın böyle olması hata verdirtiyor.
// bu yüzden başka şekilde kullandık.
// app.all('*', (req, res) => {
//     res.status(404).json({
//         message: 'Endpoint bulunamadı'
//     });
// });

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Kanban Backend API çalışıyor'});
});

// app.get('*', (req, res) => {
//     res.status(404).json({ message: 'Server Error, There is no something like that dude' });
// });

app.use((req, res) => {  // app.get('*') yerine kullandık. app.all('*') da çalışmıyor.
    res.status(404).json({ message: '404 Not Found, There is no something like that dude' });
});

// Junior için yeterli Error Handling
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
});


module.exports = app;