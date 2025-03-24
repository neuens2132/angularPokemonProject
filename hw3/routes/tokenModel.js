var mongoose = require('mongoose');

var tokenSchema = mongoose.Schema({
    name: { type: String, required: true},
    url: { type: String, required: true}
});

tokenSchema.set('toJSON', {
    transform: function(doc, result, options) {
        result.id = result._id;
        delete result._id;
        delete result.__v;
    }
});

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;