const { body, validationResult } = require('express-validator');

// const colorEnum = require('../models/Task').schema.paths.color.enumValues;
const colors = ['#ad9c00ff', '#00A88B', '#6A6DCD', '#D93535', '#C340A1', '#9c27b0', '#ff9900ff', '#101010ff', '#307FE2'];  // şimdilik bunu kullandık yukarıdaki hata verebilir diye.

const taskValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Boş bir task title söz konusu bile değil :/')
        .isLength( { max: 200 } )
        .withMessage('Hiçbir kıza böyle bir başlık verilmedi. 200 kerekteri geçme babuş'),

    body('description')
        .trim()    
        .optional()
        .isLength( { max: 1000 } )
        .withMessage('Çok uzun olmadı mı sence? Padişah fermanı mübareq :/'),

    body('status')
        .trim()
        .isIn(['backlog', 'todo', 'inprogress', 'done'])
        .withMessage('Status sadece: backlog, todo, inprogress, done olabilir. ya geçmiş ya şimdi ya da gelecek, yeni bir zaman mı icat edecen olm :/'),

    
    body('color')
        .trim()
        .isIn(colors)
        .withMessage('Böyle bir renk bilmem ben. Hayatına kattığım renkler yetmez mi sana??? :('),

    (req, res, next) => {  // nexti aşağıya ekleyip buraya eklemeyi unutmak ... 
        const errors = validationResult(req);
        // console.log(req.method);
        if(!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                message: "Bazı hataların var, formatlar düzgün değil, validation hatası"
            });
        }

        console.log("valide ettim, her şey doğru görünüyor task adına");

        next();  // classic middleware atlama anııııı
    }
];


module.exports = taskValidation;