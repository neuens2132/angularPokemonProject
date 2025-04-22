const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumSchema = new Schema({
    userId: {type: Schema.ObjectId, required: true, ref: 'User'},
    setId: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    lastModified: {type: Date, default: Date.now}
});

forumSchema.set('toJSON', {
    transform: (doc, result, options) => {
        result.id = result._id;
        delete result._id;
        delete result.__v;
    }
});

var Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;