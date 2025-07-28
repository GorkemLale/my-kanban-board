const mongoose = require('mongoose');  // mongoose kütüphanesi: MongoDB Driver'ı wrap eden(sarmalayan, kolaylaştıran, yani karmaşık kodu basit fonksiyona indirgemek) katman
// MongoDB low-level, Raw queries(ham sorgular) ve karmaşık iken mongoose kütüphanesi high-level(konuşma diline yakın), Schema/Model based olmasıyla bu karmaşık satırları bizler için wrap eder :) Mongoose -> MongoDB Driver -> MongoDB Database


const connectDB = async () => {
    try {
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Modern MongoDB driver için sadece gerekli seçenekler
            // useNewUrlParser ve useUnifiedTopology artık gerekli değil.  // peki bunlar da nedir?
        });
        // conn = connection object (bağlantı nesnesi)
        // Bu sadeece ilk bağlantı kurulduğunda çalışır. 
        // Ne döndürür: conn.connection.host -> "localhost", conn.connection.port -> 27017, conn.connection.name -> "kanban-board"

        mongoose.connection.on('connected', () => {
            console.log('MongoDB\'ye yeniden bağlanıldı', conn.connection.port)
        });


        console.log('MongoDB\'ye başarıyla bağlanıldı: ', conn.connection.host);

        // MongoDB bağlantısı için EventListener'dır. Farklı durumlarda mongoose.connection EventEmitter'ı tarafından fırlatılan EVENT'leri .on('disconnected veye error gibi şeyler') ile dinleriz.
        mongoose.connection.on('disconnected', () => {  // Bu EventEmitter bağlantı koptuğunda çalışır.
            console.log('MongoDB bağlandısı koptu');
            // Daha sonra burada reconnection logic yazabilirsin
        });

        // Bağlantı hatası olduğunda çalışacak EventEmitter (mongoose.connection, ki bu MongoDB kütüphanesi içinde )
        mongoose.connection.on('error', (error) => {  // try-catch bloğunda catch'de buna benzer bir şey bulunmasına rağmen ekledik çünkü try-catch sadece initial connection sırasında çalışırken Event listeners: connection yaşam döngüsü boyunca çalışır.
            console.log('MongoDB bağlantı hatası: ', error.message);
        });

    } catch (err) {
        console.error('MongoDB bağlantı hatası: ', err.messsage);
        process.exit(1);  // Uygulama çöksün, PM2 vs restart etsin. PM2 nedir?
    }
};

module.exports = connectDB;  // Dışarıdan erişilebilir hale getirdik.