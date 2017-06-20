var express = require('express');
var router = express.Router();
var meetup = require('../controllers/meetup');

router.post('/oauth', function (req, res, next) {
  meetup.getRefreshToken(req.body.code, function () {
    res.send(200);
  });
});

module.exports = router;
