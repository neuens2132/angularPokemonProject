var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', required: true },
    status: { type: String, enum: ['UNFINISHED', 'LOSS', 'VICTORY', 'TIE'], default: 'UNFINISHED' },
    start: { type: Date, default: Date.now },
    end: { type: Date },
    grid: { type: [[String]], default: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
    ]},
});

gameSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

var Game = mongoose.model('Game', gameSchema);

module.exports = Game;