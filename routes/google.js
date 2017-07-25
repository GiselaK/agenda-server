var express = require('express');
var router = express.Router();
var google = require('../controllers/google');
var user = require('../controllers/user');

router.post('/oauth', function (req, res, next) {
  google.getRefreshToken(req.body.id, req.body.code, function (status) {
    res.sendStatus(status);
  });
});

router.post('/getCals/:userID', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.getCals(accessToken, function (err, status, data) {
        console.log(err ? "Error:" + err: data);
        res.json(data);
    });
  });
});

router.post('/getEvents/:calID/:userID/:nextPage?', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.getEvents(req.params.userID, accessToken, req.params.calID, req.params.nextPage, function (status, data) {
      res.send(data);
    });
  });
});

router.post('/createEvent/:calID/:userID', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.createEvent(accessToken, req.body.event, req.params.calID, function (status) {
      res.sendStatus(status);
    });
  })
});

module.exports = router;
