var express = require('express');
var router = express.Router();
var google = require('../controllers/google');

router.post('/oauth', function (req, res, next) {
  google.getRefreshToken(req.body.id, req.body.code, function (status) {
    res.sendStatus(status);
  });
});

router.post('/getCals/:id', function (req, res, next) {
  google.retrieveAccessToken(req.params.id, function (err, accessToken) {
    if (err) {
      log(err);
      res.send(err);
    }
    google.getCals(accessToken, function (err, status, data) {
      if (err) {
        log(err);
        res.send(err);
      } else {
        console.log(data)
        res.json(data);
      }
    });
  });
});

router.post('/getEvents/:calID/:userID', function (req, res, next) {
  google.retrieveAccessToken(req.params.userID, function (accessToken) {
    google.getEvents(accessToken, req.params.calID, function (status, data) {
      res.send(data);
    });
  });
});

router.post('/createEvent', function (req, res, next) {
  google.createEvent(req.body.event, function (status) {
    res.sendStatus(status);
  });
});

module.exports = router;
