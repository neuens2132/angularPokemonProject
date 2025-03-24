var Tokens = require('./tokenModel');

async function init() {
    const tokenDb = [
        ["Panda", "/assets/tokens/xbox-360-profile-pictures-e2bpy4ip6cmbx6cr.jpg"],
        ["Man with beanie", "/assets/tokens/OIP.jpg"],
        ["Monkey", "/assets/tokens/OIP (1).jpg"],
        ["Smiley face", "/assets/tokens/OIP (2).jpg"],
        ["Halo Dude", "/assets/tokens/OIP (3).jpg"],
    ]

    const tokens = tokenDb.map(([name, url]) => ({
        name,
        url
    }));

    await Tokens.insertMany(tokens);
}

async function getTokenById(id) {
    return await Tokens.findById(id);
}

async function saveToken(token) {
    return await new Tokens(token).save();
}

async function getTokenByName(name) {
    return await Tokens.findOne({ name });
}

async function getTokens() {
    return await Tokens.find({});
}

module.exports = { getTokens, getTokenById, saveToken, getTokenByName, init };