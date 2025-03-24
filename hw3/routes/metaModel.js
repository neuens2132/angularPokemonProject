var mongoose = require('mongoose');

var metaSchema = mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    defaultTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
    tokens: { type: Array, default: [], elements: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true } }
});

var Meta = mongoose.model('Meta', metaSchema);

module.exports = Meta;