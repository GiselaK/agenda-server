var express = require('express');
var router = express.Router();
var google = require('../controllers/google');
var user = require('../controllers/user');
var path = require('path');

router.get('/hook', function (req, res, next) {
  res.sendFile(path.resolve(__dirname + '/../public/hook.html'));
});

/**
 * @api {GET} /oauth Get Users Refresh Token
 * @apiVersion 0.1.0
 * @apiName Authenticate
 * @apiGroup Google
 *   
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 */

router.post('/oauth', function (req, res, next) {
  google.getRefreshToken(req.body.id, req.body.code, function (status) {
    res.sendStatus(status);
  });
});

/**
 * @api {GET} /getCals/:userID Get Users Calendars
 * @apiVersion 0.1.0
 * @apiName Get Users Calendars
 * @apiGroup Google
 * 
 * @apiParam {userID} Users Unique ID
 * 
 * @apiSuccess {Object[]} calendars List of all users Google Calendars
 *  
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "calendars": [{
 *        "id": "eji3i3n2",
 *        "name": "abc@gmail.com",
 *        "timeZone": ""
 *    }]
 *    }
 */

router.post('/getCals/:userID', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.getCals(accessToken, function (err, status, data) {
        res.json(data);
    });
  });
});

/**
 * @api {GET} /getEvents/:calID/:userID/:nextPage? Get Events From Calendar
 * @apiVersion 0.1.0
 * @apiName Get Events
 * @apiGroup Google
 * 
 * @apiParam {calID} Calendars Unique ID
 * @apiParam {userID} Users Unique ID
 * @apiParam {nextPage} Next Page Token Recieved From Previous Call To This Endpoint
 * 
 * @apiSuccess {Object[]} events 250 Event objects (unless last page then it will be however many are remaining)
 * @apiSuccess {String} nextPage nextPageToken to redo request for more events or if it's the last page "undefined"
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "events": [{
 *        "id": "",
 *        "name": "Sample Event",
 *        "description": "Details About This Event",
 *        "src": "google",
 *        "startTime": "",
 *        "endTime": "",
 *        "location": ""
 *       },...],
 *       "nextPage": "2jkd23jn2ndn2"
 *     }
 */

router.post('/getEvents/:calID/:userID/:nextPage?', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.getEvents(req.params.userID, accessToken, req.params.calID, req.params.nextPage, function (status, data) {
      res.send(data);
    });
  });
});

/**
 * @api {POST} /createEvent/:calID/:userID Add Event To Calendar
 * @apiVersion 0.1.0
 * @apiName Add Event
 * @apiGroup Google
 * 
 * @apiParam {calID} Calendars Unique ID
 * @apiParam {userID} Users Unique ID
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 */
router.post('/createEvent/:calID/:userID', function (req, res, next) {
  user.retrieveAccessToken(req.params.userID, function (err, accessToken) {
    google.createEvent(accessToken, req.body.event, req.params.calID, req.body.timeZone, function (status) {
      res.sendStatus(status);
    });
  });
});

module.exports = router;
