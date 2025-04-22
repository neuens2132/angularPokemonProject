const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    id: {type: String},
    name: {type: String, required: true},
    images: { 
        small: {type: String},
        large: {type: String }
    },
    quantity: {type: Number, required: true},
    price: {type: Number, required: true}
});

const collectionSchema = new Schema({
    userId: {type: Schema.ObjectId, required: true, ref: 'User'},
    cards: [cardSchema]
});

collectionSchema.set('toJSON', {
    transform: (doc, result, options) => {
        result.id = result._id;
        delete result._id;
        delete result.__v;
    }
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;