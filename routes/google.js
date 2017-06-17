var express = require('express');
var router = express.Router();
var google = require('../controllers/google');

router.post('/oauth', function(req, res, next) {
  google.getRefreshToken(req.body.id, req.body.code, function (status) {
    res.sendStatus(status);
  });
});

router.get('/getCals/:id', function (req, res, next){
	google.retrieveAccessToken(req.params.id, function (access_token) {
		google.getCals(access_token, function (status, data) {
			res.send(data);
		});
	});
});

router.get('/getEvents/:calID/:userID', function (req, res, next) {
	google.retrieveAccessToken(req.params.userID, function (access_token) {
		google.getEvents(access_token, req.params.calID, function (status, data) {
			res.send(data);
		})
	})
});

router.post('/createEvent', function(req, res, next) {
	google.createEvent(req.body.event, function (status) {
		res.sendStatus(status);
	});
});

module.exports = router;