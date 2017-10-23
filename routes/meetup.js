var express = require('express');
var router = express.Router();
var meetup = require('../controllers/meetup');

router.get('/hook', function (req, res, next) {
  res.sendFile(path.resolve(__dirname + '/../public/meetupWebhook.html'));
});

router.post('/oauth', function (req, res, next) {
  meetup.getRefreshToken(req.body.code, function () {
    res.send(200);
  });
});

module.exports = router;
