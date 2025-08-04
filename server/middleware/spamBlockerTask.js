const rateLimiter = require('express-rate-limit');
const Task = require('../models/Task');



const spamBlocker = {
    rateLimiter: rateLimiter({
        windowMs: 3 * 1000,  // 1 saniyede, yani kısıtlı Attack süresinde. Şu anda test için 3 yaptım ama düzelteceğim!
        max: 1  // Max 1 request, yani kısıtlı request. gidip de 60 * 1000'den dakikada max: 60 demek spam'ı engellemez. bu sefer de mesela ilk saniyeden 59 spam gönderilebilir.
        // // Buradan sonrasını öğren!
        // ,trustProxy: false,  // proxy'e güvenme?
        // standardHeaders: true,  // ?
        // legacyHeaders: false  // ?
    }),
    sameInputBlocker: async (req, res, next) => {  // amanın next'i aşağıya ekleyip yukarıda unutma!!! ;)
        const existingTask = await Task.findOne({
            title: req.body.title,
            boardId: req.params.boardId,
            createdAt: { $gte: Date.now() - 1000 }  // $gte="greater than or equal", son 1 saniyede aynı task oluşturuldu mu diye bakar. bu da saldırana ek uğraş çıkarır.
        })
    
        if (existingTask) {
            return res.status(429).json({ error: "Yavaş ol aslanım"});
        }
    
        next();  // amanın unutma beni :)
    }
};

module.exports = spamBlocker;
