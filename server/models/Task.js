const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // id eklemedik çünkü MongoDB arkada gizli tutuyor (bkz _id: ObjectId, bkz internal id). Ama Board.js'te id ekledik çünkü bunu url'de kullanmak istiyoruz ve oto atanan id çirkin duruyor..  
    boardId: {  // hangi board'a ait
        type: String,
        required: true,
        index: true
    },  // Burada yaptığımız gibi referancing yaklaşımı ile Board'a bağlamak yerine Embedding yaklaşımı ile Board.js içinde tasks diye bir field tanımlayıp tasks: [{ type: Types.ObjectId, ref: 'Task' }] şekilde de tanımlayabilirdik. Ama sonraki delete işlemlerinde mesela silme işlemi yapacağımız zaman mesela await Task.findByIdAndDelete(taskId); deyip işi bitiriyorduk. Ama embedding'te bu satıra ek olarak bir de Board'tan da çıkarmamız gerekirdi yani await Board.uptadeOne( { _id: boardId }, { $pull: { tasks: taskId } } ); diye bir ek satır daha eklerdik. İğrenç weqeqwee :) Ayrıca embedding bize 16mb limit koyuyormuş qweqwe.
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low','medium','high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['backlog', 'todo', 'inprogress', 'done'],
        required: true
    },
    color: {
        type: String,
        enum: ['#ad9c00ff', '#00A88B', '#6A6DCD', '#D93535', '#C340A1', '#9c27b0', '#ff9900ff', '#101010ff', '#307FE2'],
        required: true,  // Controller'da rastgele atanacak
    },
    order: {
        type: Number,  // Hey hey, floating point destekliyor.
        default: 0,
        min: 0  // Drag & Drop...
    }
}, {
    timestamps: true  // createdAt ve updatedAt otomatik eklenmiş oldu :)
});

taskSchema.index({ boardId: 1});  // Board'a ait tasklar
taskSchema.index({ boardId: 1, status: 1});
taskSchema.index({ boardId: 1, status: 1, order: 1});

module.exports = mongoose.model('Task', taskSchema);