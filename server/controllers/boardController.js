const Board = require('../models/Board');
const generateUniqueId = require('../utils/uniqueIdGenerator');

// Object tanımlıyoruz. Her method için Bussiness Logic tanımlayan fonksiyonlar barındıran bir Obje döndüreceğiz.
const boardController = {  // Object içinde tanımlayacağımız için Key şeklinde fonksiyon adı tanımlarken value şeklinde logic tanımlayacağız 
    getAllBoards: async (req, res) => {
        try {
            const boards = await Board.find().sort({ lastVisited: -1 });
            console.log("Bütün table'ları ehm collection'ları getirdim");
            
            if(boards.countDocuments === 0) {
                console.log("Database'de herhangi bir board yok.");
                return res.status(404).json({
                    message: "Yok abi sana tahta falan :/"
                });
            }
            // console.log("data",boards);
            page = 10;  // şimdilik manuel 10'arlı gösterelim.
            res.status(200).json({
                success: true,
                data: boards,
                page: page,  // değişkeni direkt 10'a eşitlersen bu satırda, hata alırsın :)!!!
                totalPages: Math.ceil( await Board.countDocuments() / page )
            });
        } catch (err) {
            console.error("Table'lar getirilemedi");

            res.status(500).json({
                success: false,
                message: "Board'lar getirilemedi",
                error: error.message
            });
        }
    },

    createBoard: async (req, res) => {
        try {
            const { title, description, color } = req.body;  // await neden gereksiz
            const uniqueId = await generateUniqueId();
    
            const newBoard = new Board({
                id: uniqueId,
                title,
                description,  // lastVisited, taskCount falan default'tan atanıyor. Bu yüzden default'u olmayanları almak yetiyor sadece.
                color: color
            });
    
            await newBoard.save();
            console.log(newBoard);
            res.status(201).json({  // 201 success created, başına return koymana gerek yok ama koyunca da hata vermiyor ;)
                success: true,
                data: newBoard,
                message: "Yeni Board veritabanına eklendi :)"
            });
        } catch (error) {
            console.error("board oluşturulamadı",error.message);  // ben direkt error dönmüştüm, o zaman da fena değildi :) böyle olunca da önce gösterdiği uzun çıktının ilk satırını veriyor sadece board oluşturulamadı Cannot destructure property 'title' of 'req.body' as it is undefined.
        }
    },

    getBoardById: async (req, res) => {
        try {
            const { id } = req.params;
            const board = await Board.findOne({ id });  // bizim tanımladığımız id elimizde ve bu da bir field olduğu için findOne kullandık. eğer elimizde _id yani arkada mongoDB'nin oluşturduğu id olsaydı o zaman da hem bunu hem de bunun yerine findById() ile kullanabilirdik.

            if (!board) {
                return res.status(404).json({  // Bu res.status.json'lar yerine ayrı bir dosyada fonksiyon tanımlayıp atıyorum error için return hataYaniti(res, message(örneğin "Board Bulunamadı"), statusCode(örneğin 404)); diye bir şey de tanımlayabilirdik. export edilecek fonskiyon içinde return res.status(statusCode).json({success: false, message: message}); gibi bir şey tanımlardık böyle bir senaryoda. Buna return eklemesem bir de ana try'ın catch'ine giriyor. Eklemeyince return'u veriyor 500'ü 404 yerine. 
                    success: false,
                    message: "Board Bulunamadı"
                });
            }
            
            board.lastVisited = new Date();  // Date.now() kullanmadık çünkü lastVisited field'ı Board.js'te type: Date olarak tanımlanmış. Yani Date objesi atamak lazım. Tersini yapsak yani Date.now() ile Number türünde 17064366455123 gibi bir değişken atasaydık o zaman da çalışırdı MongoDB otomatik çevirirdi ama yanlış bir yaklaşım olurdu. Şimdi arkada Date Object şeklinde tutulacak: 2025-07-29T10:27:07.411+00:00 gibi bir şey.
            
            // console.log("Buldum ve kaydettim", board);
            
            try {  // Bunu ekledik çünkü test verisini manuel oluştururken title oluşturmayı unutmuşum. title field required: true olarak işaretlendiği için kaydedemiyorduk. board.save diyeceğiz ve sadece bir değerini değiştirdik. ama içinde title olmadığı için kendini güncelleyemiyordu.
                await board.save();  // üstte son ziyaret tarihi değiştirdiğimiz için kaydetmek durumundayız.
            } catch (validationErr) {
                console.log("Veriyi kaydedemedik \nValidation error: ", validationErr.message);  // Bu hatadan sonra aşağıdaki json çalışır ama board eski lastVisited değeri ile döner.
            }
            
            res.status(200).json({
                success: true,
                message: `${id}'li Board Gösteriliyor.`,
                data: board
            });

        } catch (err) {
            console.error("Board getirilemedi :/", err.message);
            res.status(500).json({
                success: false,
                message: "Board getirilemedi :/\n" + err.message
            });
        }
    },

    updateBoard: async (req, res) => {  // Board güncelleme.  // merak etme frontend'in url'leri farklı olduğu için hem ana sayfa hem de board'ın olduğu sayfadaki url'leri sadece bu url'ye yönlendirebilirsin :)
        try {
            const { id } = req.params;  // :id gibi : bulunduran url öğelerini çeker.
            // !!! Aslında ben frontend'de de yaptığım gibi gelen her yeni veriyi eskisiyle kıyaslayıp ona göre toplama bir board oluşturup save edecektim ama buna gerek kalmadı çünkü MongoDB yeterince akıllıymış. Bakınız:
            const updatedDatas = req.body;
            const board = await Board.findOneAndUpdate(
                { id: id },
                updatedDatas,  // veya {...updatedDatas}
                {new: true}
            );
            // title'de 100. karaktere de okey ama 101'de fıttırıyor (res.status(400).json{message}), istediğimiz gibi
            // description'da da 501'de kuduruyor.
            // await board.save();  // gereksiz mongoose'un update'li method'ları otomatik kayıt yapıyor. aynısı delete'ler için de geçerli
            console.log(board);
            
            res.status(200).json({
                success: true,
                message: "paşalar gibi güncelledik board'umuzu",
                data: board
            });
        } catch (err) {
            console.error("Board Güncellenemedi:", err.message);
            res.status(500).json({
                success: false,
                message: "Board güncellenmiyor bipbop",
                error: err.message
            });
        }
    },

    deleteBoard: async (req, res) => {
        try {
            const { id } = req.params;
            const board = await Board.findOneAndDelete({ id: id });  // const eklemeyi unutma başa. Ayrıca findOneAndDelete kullan. Gidip de yanlışlıkla findByIdAndDelete kullanma çünkü o sadece _id'de çalışır. Board'tan id'si id'ye eşit bir Document bulur, siler ve board'a eşitler. Eğer bulunmadıysa silinmemiştir ve board'a atanmamıştır demektir. Yani aşağıdaki if çalışır.
            
            if (!board) {  // eğer böyle bir board bulunmadıysa
                return res.status(404).json({  // Tıpkı aynı endpoint'in get methodunda olduğu gibi bunda da return eklemezsek siteye veya postman'e 404 error veriyor ama console'a 500 error veriyor. return ile ana try'ın catch'ine atlamasını önlüyoruz.
                    success: false,
                    message: "There is no Board to delete"
                });
            }

            console.log("Board başarıyla silindi.");

            res.status(200).json({
                success: true,
                message: "Board başarıyla silindi",
                data: board  // istersek göndermeyiz silinen board'u
            });    
        } catch (err) {
            console.error("Board silinemedi", err.message);
            res.status(500).json({
                success: false,
                message: "Board silinemedi",
                error: err.message
            });
        }
    }

};

module.exports = boardController;