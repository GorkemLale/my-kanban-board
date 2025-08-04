const Board = require('../models/Board');  // kullanacak mıyım bilmiyorum. ileride göreceğiz. eklemiş olayım. Evet çünkü taskCount'u var her board'un. Her eklemede ve silmede güncellenmesi lazım.
const Task = require('../models/Task');
const orderRebalancer = require('../utils/orderRebalancer');

const taskController = {
    getAllTasks: async (req, res) => {
        try {
            const { boardId } = req.params;
            const tasks = await Task.find({ boardId: boardId }).sort({ status: 1, order: 1 });
            console.log(`${boardId} ID'li board'daki tüm task'leri getirdim`);
            // console.log(typeof tasks);  // array'ler de object olarak çıktı verir, tasks yerine [1,2,3] koyup denedim.
            if (tasks.length === 0) {  // yeni oluşturulan board için problem oluşturur gibime geliyor. düzenlemek lazım.
                console.log("Abe weerri tebbanında weerri yuktur.");
                await Board.findOneAndUpdate({id: boardId}, {taskCount: 0});
                return res.status(200).json({
                    success: true,
                    message: "Veri tabanında görev yok. Yeni görev ekle",
                    data: [],
                    count: 0
                });
            }
            // await Board.findOneAndUpdate( { id: boardId }, { taskCount: tasks.countDocument } );  // createTask'e öncesinde Board.findOneAndUpdate() eklenmediği için taskCount'un sayısı eski görevlerde güncellenmediği için sabit sayıda eksik görünüyor. Bunu böyle halletmek performans sıkıntısı demektir bu yüzden manuel eşitledim. zaten her board'a task eklenince veya yeni board oluşturulup eklenince düzgün şekilde çalışacak.
            // console.log( tasks.length );  // object olduğu için length falan kullanabiliriz ve bu sayede count güncelleyebiliriz.

            ['backlog', 'todo', 'inprogress', 'done'].map((stat) => {
                orderRebalancer(boardId, stat);
            });

            res.status(200).json({
                success: true,
                message: "All bütün görevler senin olsun, ama paşa paşa yapacan haa. (ahmak herif başına iş açtı)",
                data: tasks,
                count: tasks.length
            });
            
            
        } catch (err) {
            console.error('Taskler getirilemedi', err.message);
            res.status(500).json({
                success: false,
                message: "Taskler getirilemedi",
                error: err.message
            });
        }
    },

    createTask: async (req, res) => {
        try {
            const { boardId } = req.params;
            const newTask = req.body;  
            // const { title, description, priority, color, status } = req.body;   // diye de yapabilirdik İlginç bilgi: sıra önemli değil, Object key'lerin sırası fark etmez. !!!hatta const { color } = req.body; yapsaydım da sadece color çekerdi.
            console.log("body denemesi", req.body);
            const isItFirst = await Task.find({ boardId, status: newTask.status }).countDocuments();  // find içine newTask.status yaparsan unexpected token '.' hatası verir. Ama onu status: newTask.status diye alırsan işler başka. çünkü sade eleman gönderince adı aynı olan field'a gönderiyor.

            let order = 0;
            // let order;  // d&d taşımaları göz önüne alınınca bile çok güzel değer. Ayrıca let olmasına dikkat et çünkü değer atıyoruz!
            if (isItFirst === 0) {
                order = Math.pow(2,50);
                // tanımlı olduğu gibi kalsın. Gerçeği bu if'e gerek yoktu ama kalsın :) İçine taşıyınca order'ı local scope hatası alırız!!!
            } else if (isItFirst >= 50 ) {
                console.log("Bir listeye max 50 görev ekleyebilirsin.");
                return res.status(403).json({
                    success: false,
                    message: "max 50 task tek listede"
                });
            } else { // [{order: 6}]
                const minOrder = await Task.find({ boardId, status: newTask.status }).sort( {order: 1}).limit(1);  // order'a göre küçükten büyüğe sırala sonra da sadece ilkini al. Yani en küçük order'lı olanı aldık. çünkü Array(object) dönüyor 1 tane bile olsa.
                order = minOrder[0].order/2;  // canımı çıkardı! direkt yukarıda [0].order olmuyor!!
            }
            console.log(order);
            const task = new Task ({...newTask, boardId, order});
            // console.log(`${boardId} board'u için ${status} alanında ${title} adlı bir task ${Date.now()} tarihinde oluşturuldu`);
            await Board.findOneAndUpdate({ id: boardId }, { $inc: {taskCount: 1} });  // task count'u bir arttır.
            
            await task.save();
            res.status(201).json({  // 201 created
                success: true,
                message: "Al sana bir görev dahaaa",
                data: task
            });
            
        } catch (err) {
            console.log("Task oluşturulamadı", err.message);
            res.status(500).json({
                success: false,
                error: err.message,
                message: "Task oluşturulamadı"
            });
        }
    },

    updateTask: async (req, res) => {
        try {
            const updatedTask = req.body;

            const task = await Task.findByIdAndUpdate(
                updatedTask._id,
                updatedTask,
                {new: true}
            );
            
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: "Böyle bir task yok."
                });
            }

            res.status(200).json({
                success: true,
                message: "Task başarıyla güncellendi.",
                data: updatedTask
            });
            // !!! drag and drop ile olabilecek değişimler için böyle bir şey düşünmüştüm. Çok uğraştırır ayrıca status değişimini de eklemek gerekirdi temp.status = newStatus diye;
            // Bunun yerine bulduğumuz yöntem floating point. bin kat daha basit. her işlemde yerleştirmek istediğimiz noktanın öncesinin ve sonrasının order ortalamasını alıyoruz. gerçek hayatta 1 ve 2 arası sonsuzdur. bilgisayarda sonsuz olmasa da çoook büyük ve doldurulması imkansız. 
            // const newOrder = req.body.newOrder;
            // const oldOrder = req.body.oldOrder;
            // const boardId = req.body.boardId;
            // const tasks = await find({ id: boardId}).sort({ status: 1, order: 1});

            // if ( oldOrder < newOrder  ) {
            //     const temp = await tasks.findOne({order: oldOrder});
            //     for (let i = oldOrder; i < newOrder; i++) {
            //         await tasks.findOneAndUpdate({ order: i + 1 }, {order: i });
            //     }
            //     temp.order = newOrder;
            // }
            // if ( newOrder < oldOrder ) {
            //     const temp = await tasks.findOne({ order: oldOrder });
            //     for ( let i = newOrder; i < oldOrder; i++ ) {
            //         await tasks.findOneAndUpdate({ order: i }, { order: i + 1 });
            //     }
            //     temp.order = newOrder;
            // }
        } catch (err) {
            console.log("Task güncelleme hatası", err.message);
            res.status(500).json({
                success: false,
                message: "Task güncelleme hatası",
                error: err.message
            });
        }
    },

    deleteTask: async (req, res) => {
        try {
            const id = req.body._id;  // body {_id: id} iken body._id direkt id'ye eşittir.
            console.log(id, typeof id);
            const task = await Task.findByIdAndDelete(id);

            if (!task) {
                console.log("Silinecek böyle bir task yok!");
                return res.status(404).json({
                    success: false,
                    message: "Silinecek böyle bir task yok!"
                });
            }

            await Board.findOneAndUpdate({id: id}, {$dec: {taskCount: 1}})
            res.status(200).json({
                success: true,
                message: `Task id:${id} başarıyla silindi :)`
            });
        } catch (err) {
            console.log("Task silinemedi :/", err.message);
            res.status(500).json({
                success: false,
                message: "Task silinemedi :/",
                error: err.message
            });
        }
    }
};

module.exports = taskController;