const mongoose = require('mongoose');  // mongoose kütüphanesi: MongoDB Driver'ı wrap eden(sarmalayan, kolaylaştıran, yani karmaşık kodu basit fonksiyona indirgemek) katman
// MongoDB low-level, Raw queries(ham sorgular) ve karmaşık iken mongoose kütüphanesi high-level(konuşma diline yakın), Schema/Model based olmasıyla bu karmaşık satırları bizler için wrap eder :) Mongoose -> MongoDB Driver -> MongoDB Database

// senkron bir fonksiyonda bulunan listener'lar asenkron olarak arkaplanda çalışır. fonksiyon bir kere çağırılınca içindeki işlemler biter ama içindeki listenerlar arkaplanda aktif hale getirilir. yani bir çalar saati bir kere kurduğumuzda arkaplanda çalışıp zamanı gelince tetiklenmesi ve çalması gibi bir şey. senkronun mantığı satır satır beklemektir ama içinde listener varsa onu kaydetmek senkron bir işlemken çalışması asenkrondur. element.addEventListener('click', callback); işlemi senkron'dur. ama Ama arkada asenkron olarak yaşamaya devam eder.

// Asenkron bir fonksiyonda bulunan listener'lar yine asenkron olarak arkaplanda çalışır. Tek fark, async fonksiyonun kendisi Promise döndürür ve await ile beklenebilir.

/* Promise nedir? "Sana söz yanıt vereceğim." diye söz verme işlemidir. Mesela server'dan yanıt bekliyoruz. JavaScript'te tek thread ile çalışırken uzun istek işlemlerinde UI donabilir. Bu yüzden kodun devam etmesini sağlıyoruz. 
const promise = nonBlockingOperation(); diye bir çağrımda bulunurken mesela normalde promise döndürmeyen bir şey olsa kod veri gelene kadar o satırda örneğin 5 saniye donardı. Bundan dolayı da UI donardı çünkü main-thread bloklanırdı. Ama promise döndüğü için gerçek verinin gelmesi 5 saniye de sürse o satırda anında Promise Objesi döner ve kod devam eder. Mesela:

    const promise = nonBlockOperation();
    promise.then(data => console.log(data));  // Bu satır kaydedilir ama çalışmaz yani "şimdilik" aşağı satırlara atlanır. data geldiği anda örneğin 5 saniye sonra çalışır.
    console.log("ben hemen çalıştım");
    ... diğer senkron işlemler, hemen çalışırlar.

Promise ile yapılması gereken işlem asenkron olarak arkaplanda çalışır ve diğer işlemler devam eder. Promise resolve olduğu anda ise .then içindeki callback'ler devreye girer. Bu sayede UI donmaz ve "yükleniyor..." tarzı bir şey gösterme fırsatımız olur.

*/


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

        // Bağlantı hatası olduğunda çalışacak EventListener(.on('error', callback)), EventEmitter (yani mongoose.connection, ki bu MongoDB kütüphanesi içinde ) tarafından fırlatılabilecek olan 'error' Event'ini dinler.
        mongoose.connection.on('error', (error) => {  // try-catch bloğunda catch'de buna benzer bir şey bulunmasına rağmen ekledik çünkü try-catch sadece initial connection sırasında çalışırken Event listeners: connection yaşam döngüsü boyunca çalışır.
            console.log('MongoDB bağlantı hatası: ', error.message);
        });

    } catch (err) {
        console.error('MongoDB bağlantı hatası: ', err.messsage);
        process.exit(1);  // Uygulama çöksün, PM2 vs restart etsin. PM2 nedir?
    }
};

module.exports = connectDB;  // Dışarıdan erişilebilir hale getirdik.