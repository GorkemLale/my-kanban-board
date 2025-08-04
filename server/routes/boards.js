const express = require('express');
const { boardValidation, checkBoardValidation } = require('../middleware/validationBoard');
const boardController = require('../controllers/boardController');

// MongoDB için konsept:
/*  Database -> Collection -> Document: Aslında hiyerarşisi bu. Database Collection'lardan oluşuyor o da Document'lerden
        Database = Database
        Collection = Table
        Document = Row
        Fields = Column, mantık hep aynı, makine öğrenmesinde de dataFrame için feature diye isimlendiriyoruz :) 
    CRUD İşlemleri:
        Create (Kayıt ekleme):
            await Task.create({ title: "Yeni task" });  // böyle tek kayıt da yapabiliriz
            await Task.insertMany([task1, task2, task3]);  // böyle çoklu da kaydedebiliriz
        Read (Okuma yani görüntüleme(sadece görüntüleme :D))
            await Task.find();  // Hepsini getirirken
            await Task.find({ status: "todo" })  // ile de filtreleyerek getiririz.
            await Task.findOne({ id: "abc123" });  // Bizim eklediğimiz özel id field'ını arar. Bu projede bunu Task için kullanmayacağız, sadece Board için kullanacağız. Çünkü Task için spesifik id kullanmadık, boardId ile hangi board'a ait olduğunu belirtip status ve order ile de yatay ve dikey eksende nerede olduğunu kesinleştirdik.
            üsttekini sadece id'de kullanmadık, kendimiz özel olarak tanımladığımız her field için geçerli bu.
            await Task.findById("95ı3egoporwfsngposfcartcurt");  // Bu ise MongoDb'nin otomatik ID field'dında arar.
                // await Task.findOne({ _id: "95ı3egoporwfsngposfcartcurt"});  // Bu da yukarıdakinin eş değeridir. Aynı işi yaparlar.
            Paging: verileri sayfalara bölmek
                await Task.find().limit(10).skip(20);  // skip ilk 20 kaydı atlar. limit de sonraki 10 kaydı getirir. yani yaptıkları şey totalde [21,30] arası Document'leri getirmektir.
                    // Gerçek örnek:
                    const getTasks = async (req, res) => {
                        const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 10;
                        const tasks = await Task.find().limit(limit).skip((page - 1) * limit);
                        // response
                        const totalCount = await Task.countDocument();  // document (satır) sayısını verir.
                        res.json({
                            data: tasks,
                            page: page,
                            totalPages: Math.ceil(totalCount / limit);  // ceil methodu yuvarlama yapıyor ama klasik yuvalama değil. Math.ceil(2.0) = 2 iken 2.1 = 3 olur. Sayfalama için mantıklı olan yuvarlama şekli de budur :)
                        });
                            
                    }
            Sorting:
                await Task.find().sort({ createdAt: -1 });  // 1 olsaydı Ascending(A->Z,1->9, Eski->Yeni'ye yani). Ama burası -1 olduğu için Descending(Z->A,9->1, Yeni->Eski'ye yani)
                await Task.find().sort({ title: 1 });  // Alfabetik sıralama
                await Task.find().sort({ priority: -1, createdAt: -1 });  // Önce priority'ye göre sonra da tarihe göre sıralar. Yeni->Eski
            Chain Yapısı (Zincir):
                // Hepsini birleştir:
                await Task.find({ status: "todo" })  // Filter
                            .sort({ createdAt: -1 })  // Sort
                            .limit(10)  // Limit
                            .skip(20)  // Skip
                            .select('title status priority');  // sadece bu field'lar
                Eşdeğer SQL ise şöyledir: SELECT title, status, priority FROM tasks WHERE status = "todo" ORDER BY createdAt DESC LIMIT 10 OFFSET 20
        Update (Güncelleme):
            await Task.findByIdAndUpdate(id, {title: "Yeni başlık" });
            await Task.UpdateOne({ id: "abc" }, {status: "done" });  // id'si 123 olanın status'unu done yapar. dönen değer olarak acknowledge(true: MongoDB işlemi kabul etti, false: reddetti), modifiedCount(Bulduğu sonuçların kaçını değiştirdi.), matchedCount(kaç tane sonuç buldu) eğer zaten done ise dönüş değerimiz {acknowledge: true, modifiedCount: 0, matchedCount: 1} olur. Eğer done değilse de {true, 1, 1} olur.
*/


const router = express.Router();  // Amanın const unutma


// base url, bu router'ı module.exports = router; ile buradan export edip app.js'e const boardRouter = require('./routes/board'); ile import ettikten sonra app.js'te app.use('/api/boards', boardRouter); ile ayarlanmıştır. yani artık burada '/' demek '/api/boards' demektir.

// Tüm kayıtlı board'ları getir.
router.get('/',  boardController.getAllBoards);

router.post('/', boardValidation, checkBoardValidation, boardController.createBoard);

router.get('/:id', boardController.getBoardById);

router.put('/:id', boardValidation, checkBoardValidation, boardController.updateBoard);

router.delete('/:id', boardController.deleteBoard);

module.exports = router;
