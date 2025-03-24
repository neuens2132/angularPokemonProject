var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.set('toJSON', {
    transform: function(doc, result, options) {
        result.id = result._id;
        delete result._id;
        delete result.__v;
    }
});

var User = mongoose.model('User', userSchema);

module.exports = User;