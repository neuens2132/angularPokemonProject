var Token = require('./tokenModel');
var Theme = require('./themeModel');
var express = require('express');
var router = express.Router();
var Meta = require('./metaModel');

const metaDefault = {
    color: '#ff0000',
    playerToken: null,
    computerToken: null
}

// GET meta for an authorized user
router.get('/', async (req, res, next) => {
    const userId = req.user._id;
    const meta = await Meta.findOne({ playerId: userId });

    try {
      const setOfTokens = await Token.find();
      const playerToken = setOfTokens[Math.floor(Math.random() * setOfTokens.length)];
      const computerToken = setOfTokens.find(token => token._id.toString() !== playerToken._id.toString());
      
      if (meta) {
        const theme = await Theme.findOne({ _id: meta.defaultTheme });
        const tokens = await Token.find();
        
        return res.status(200).json({
          theme,
          tokens
        });
      } else {
        const playerTokenId = playerToken._id;
        const computerTokenId = computerToken._id;
        const metaTheme = { ...metaDefault, playerToken: playerTokenId, computerToken: computerTokenId };
        const theme = new Theme({
          playerId: userId,
          ...metaTheme
        });
        await theme.save();
        
        const defaultMeta = new Meta({
          playerId: userId,         
          defaultTheme: theme._id,   
          tokens: setOfTokens.map(token => token._id) 
        });
        await defaultMeta.save();
        
        const tokens = await Token.find();
        
        res.status(200).json({
          theme,
          tokens
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve metadata' });
    }
  });
  
module.exports = router;