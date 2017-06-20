var express = require('express');
var router = express.Router();
var ticketMaster = require('../controllers/ticketMaster');

router.post('/oauth', function (req, res, next) {
  ticketMaster.getRefreshToken(req.body.code, function (events) {
    res.send(events);
  });
});

module.exports = router;
