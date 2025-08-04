// Manuel Tanımlama İstersen:

// const validateBoard = (req, res, next) => {
//     const {title, description} = req.body;

//     // Kontroller
//     if(!title || title.trim().length === 0) {   // title.trim().length yerine direkt trim() de olur ama cırt! böyle daha güvenli. her iki durumda da değil alınabilir. böyleyken !== yapardık. sade trim durumunda yani !title.trim() şekliyle başına koyduğumuz ünlemle falsy yapardık. 
//         return res.status(400).json({
//             error: "Title Zorunlu"
//         });
//     }

//     if(title.length > 100) {
//         return res.status(400).json({
//             error: "Title Çok uzun. (En fazla 100 karakter olabilir)"
//         });
//     }

//     // benzerlerini description için de yaptığını düşün.
    
//     next();  // Bu aşamalar geçildiyse yani hata döndürmediyse bir sonraki middleware'a geçsin. Bu olmasa geçmez.
// };


const { body, validationResult } = require('express-validator');

const boardValidation = [
    body('title')
        .trim()  // trim kontrol değil, sadece temizleme işlemidir. aşağısına kontrol olması açısından mutlaka ya notEmpty ya da isLength için min 1 koyulması gerekmektedir. 
        .notEmpty()
        .withMessage('Title Zorunlu')  // üstteki şart sağlanmazsa alttaki mesaj döner.
        .isLength({ max: 100 })  // Veya direkt min:1, max: 100 gireriz ve notEmpty() kontrolüne gerek kalmaz. Ama öncesinde .trim() eklememiz lazım yoksa boşluklarla dolu bir string'i de başlık olarak algılar.
        .withMessage('Title çok uzun, max 100 karakter'),

    body('description')
        .trim()
        .optional()  // kendisi opsiyonelse boş veya dolu olma durumuna bir mesaj döndürmeye gerek yoktur.
        .isLength({ max: 500 })
        .withMessage('Çoook uzun description, destan yazacaksan da 500 satırda hallet')
];


// Aşağıdaki fonksiyon böyle ayrı da tanımlanabilir, middleware array içine 3. parametre olarak verilerek de [body('title')..., body('description'), (req,res,next) => {};]. ve yukarıdaki array içindeki body() işlemleri ve bu fonksiyon içindeki validationResult express-validator tarafından otomatik olarak birleştirilir. teknik olarak açıklarsak da "express-validator middleware array'i otomatik chain yapıyor."
const checkBoardValidation = (req, res, next) => {
    const errors = validationResult(req);  // validation Objesi
    if (!errors.isEmpty()) {  // error bir validation Objesidir, string veya array değil. Bu yüzden errors.length diye bir şey yok, === 0 ile de kontrol edemeyiz bu yüzden de. Ayrıca .trim() de yok. String'ler için geçerli bu. trim().length hiç hiç yok :)
        return res.status(400).json({  // yukarıdaki koşula göre isEmpty() değilse demiş oluyoruz, yani en az 1 tane bile hata varsa
            success: false,
            errors: errors.array(),  // array'e çevirdik.
            message: "Validation Hatası."
        });
    }
    console.log("valide ettim");
    next();  // Herhangi bir hata döndürmez ve bu çalışır. Bunun sayesinde de sonraki middleware'a geçilir.
    
};

module.exports = { boardValidation, checkBoardValidation };  // birden fazla öğe gönderileceği zaman süslü parantez kullanılır, tek export ettiğin zaman da kullanabilirsin ama ne gerek var? Bir tane öğe gönderirken kullanırsan import edildiği yerde karşılanırken yine süslü parantez kullanılarak import edilir.