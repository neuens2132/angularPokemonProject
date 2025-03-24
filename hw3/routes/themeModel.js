var mongoose = require('mongoose');
var Token = require('./tokenModel');

var themeSchema = mongoose.Schema({
    playerId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    color: { type: String, required: true, match: /^#([A-Fa-f0-9]{6})$/ },
    playerToken: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
    computerToken: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true }
});

var Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;