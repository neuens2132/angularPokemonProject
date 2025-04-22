var express = require('express');
var router = express.Router();

router.all('*', function(req, res, next) {
    console.log("Authenticated: ", req.isAuthenticated());
    if (req.isAuthenticated()) {
      return next();
    }

    res.status(401).json({ message: 'Unauthorized' });
});

module.exports = router;