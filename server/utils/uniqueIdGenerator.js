const Board = require('../models/Board');  // to compare this "pseudo" unique ID with old ones. Then we can decide whether return or not. 

const generateUniqueId = async () => {  // async çünkü collection'da daha önce bundan var mıydı diye kontrol edeceğiz. eğer varsa yenisini üreteceğiz ki çakışmasın.
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';  // amanın dikkat const yapma, const'u değiştiremezsin.
    let isUnique = false;  // amanın dikkat const yapma!!!!
    while (!isUnique) {
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));  // charAt yerine köşeli parantez de kullanabilirdik. Tek farkları index dışına çıkıldığında köşeli parantez [] undefined verirken, charAt boş string "" verir. Bu proje için fark etmez hangisini kullandığımız. Ayrıca charAt tüm browser'larda çalışırken köşeli parantez [] öyle değildir. Ayrıca Math.floor ise Math.ceil'in tam tersi olarak sayıyı aşağıya yuvarlar.
        }
        
        const existingBoard = await Board.findOne({ id: result });
        if (!existingBoard) {
            isUnique = true;
        }
    }

    return result;
    
}

module.exports = generateUniqueId;