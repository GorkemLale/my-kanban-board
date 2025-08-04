const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true  // 
    },
    title: {
        type: String,
        required: true,
        trim: true,  // başındaki ve sonundaki boşlukları siliyor otomatik. Biz bunu ön kontrollerle de sağlayacağız ama riske atmamak adına. 
        maxlength: 100
    },
    description: {
        type: String,
        required: false,  // zorunlu değil. default değer de false ama özellikle belirtmek istedim ;)
        trim: true,
        maxlength: 500
    },
    lastVisited: {
        type: Date,
        default: Date.now
    },
    taskCount: {
        type: Number,
        default: 0,
        min: 0
    },
    color: {
        type: String,
        required: true  // Controller'da rastgele değer ataması yapılacak. ayrıca hex format kontrolü de eklenecek.
    }
}, {
    timestamps: true
});

boardSchema.index({ id: 1, lastVisited: -1 });  // istersek virgülsüz 2 satırda da ayrı ayrı ekleyebiliriz. id ascending iken lastVisited descending index'tir. Ayrıca id: 1 demesek de olur çünkü şemadaki field içinde tanımladık zaten. descendik için ise field içinde id: -1 gibi bir şey hata vereceği için mongoose.Schema().index methodunu kullanmak zorundayız.
boardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Board', boardSchema);  // Board olarak import edeceğiz ama bunun sebebi burada 'Board' olarak adlandırmamız değil, dosyanın adının böyle olmasıdır.