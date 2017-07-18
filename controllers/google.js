// var Promise = require('bluebird');
var request = require('request');

var baseURL = 'https://www.googleapis.com/calendar/v3';

var googleAuth;
var redirectURI = require('./controllersData').redirect_uri;
var timeConverter = require('../helpers/timeConverter');
var refreshTokenHandler = require('../helpers/refreshTokens');
var nextSyncTokenHandler = require('../helpers/nextSyncToken');
var tokenURL = 'https://www.googleapis.com/oauth2/v4/token';
var logger;

var log = function (err) {
  if (process.env.NODE_ENV === 'dev') {
    logger.error(err);
  } else {
    console.log(err);
  }
}

if (process.env.NODE_ENV === 'dev') {
  googleAuth = require('../apikeys').google;
  logger = require('tracer').console();
} else {
  googleAuth = JSON.parse(process.env.google);
  console.log("googleEnv:", googleAuth.client_id)
}

exports.getRefreshToken = function (userID, code, next) {
  request.post({url: tokenURL, form: {client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: 'authorization_code', redirect_uri: redirectURI, code: code}}, function (err, resp, body) {
    if (!err) {
      var parsedBody = JSON.parse(body);
      console.log("pb:",parsedBody)
      refreshTokenHandler.saveRefreshToken(userID, 'google', parsedBody.refresh_token, next);
    } else {
      log(err);
    }
  });
};

exports.retrieveAccessToken = function (userID, next) {
  function getAccessToken (refreshToken) {
    request.post({url: tokenURL, form: {refresh_token: refreshToken, client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: 'refresh_token'}}, function (err, resp, body) {
      if (!err) {
        var accessToken = JSON.parse(body).access_token;
        console.log(JSON.parse(body),"controller :44")
        console.log("accessToken:",accessToken)
        next(null, accessToken);
      } else {
        log(err);
        next(err);
      }
    });
  }
  refreshTokenHandler.retrieveRefreshToken(userID, 'google', getAccessToken);
};

exports.getCals = function (accessToken, next) {
  console.log("accesstoken:",accessToken)
  request.get({url: baseURL + '/users/me/calendarList'}, function (err, resp, body) {
    if (!err) {
      var retrievedCals = JSON.parse(body).items;
      var result = retrievedCals.map(function (retrievedCal, index) {
        var calResult = {};
        // keys returned from api call :
        // kind, etag, id, summary, timeZone, colorId, backgroundColor, foregroundColor, accessRole, defaultReminders
        calResult['name'] = retrievedCal['summary'];
        calResult['id'] = retrievedCal['id'];
        return calResult;
      });
      next(null, 200, {calendars: result});
      // Promise.all(retrievedCals.map(function(cal, index) {
      //     return exports.getEvents(accessToken, cal.id).then(function (newEvents) {
      //      if (newEvents) {
      //        response.events = response.events.concat(newEvents);
      //      }
      //     });
      // })).then(function () {
      //  next(response);
      // });
    } else {
      next(err);
      log(err);
    }
  }).auth(null, null, true, accessToken);
};
// exports.getProfile = function (access_token, next) {
//  request.get({url: "https://www.googleapis.com/plus/v1/people/me"}, function (err, resp, body) {
//    var body = body ? JSON.parse(body): undefined;
//    if (body) {
//      var id = body.id;
//      if (err) {
//        var errStatusCode = JSON.parse(err).error.code;
//        next(errStatusCode);
//      } else {
//        console.log("id:", body);
//        next(200);
//      }
//    } else {
//      next(400);
//    }
//  }).auth(null, null, true, access_token);
// }
exports.getEvents = function (userID, accessToken, calID, nextPage, next) {
  log("pro:", arguments)
  // var getTimeMin = function () {
  //   var pastDate = new Date();
  //   var daysBack = 7;
  //   pastDate.setDate(pastDate.getDate() - daysBack);
  //   return pastDate;
  // };
  // var getTimeMax = function () {
  //   var futureDate = new Date();
  //   // var monthsAhead = 1;
  //   futureDate.setMonth(futureDate.getMonth() + 1);
  //   return futureDate;
  // };
  // var timeMin = timeConverter.convertToRFC339(getTimeMin());
  var url = baseURL + '/calendars/' + calID + '/events?' + 'orderBy=updated&maxResults=250';
  // var timeMax = timeConverter.convertToRFC339(getTimeMax());
  if (nextPage) {url += ("&pageToken=" + nextPage)};
  nextSyncTokenHandler.retrieve(userID, 'google', function (syncToken) {
    if (syncToken) {
      url+=('&syncToken=' + syncToken)
    }
    retrieveEventsRequest();
  });
  var retrieveEventsRequest = function () {
    request.get({url: url}, function (err, resp, body) {
      if (err) {
        console.log("ERROR:", err, "Attempted URL", url);
      } else {
        var events = [];
        try {
          var data = JSON.parse(body);
          var retrievedEvents = data.items;
          if (data.error) {
            next(400, data.error.message);
          }
          if (retrievedEvents) {
            retrievedEvents.forEach(function (value, index) {
              var time = {};
              if (value.start) {
                var RFC339StartTime = value.start.dateTime || value.start.date;
                time.start = timeConverter.RFC3339ToUTC(RFC339StartTime) / 1e3;
              }
              if (value.end) {
                var RFC339EndTime = value.end.dateTime || value.end.date;
                time.end = timeConverter.RFC3339ToUTC(RFC339EndTime) / 1e3;
              }
              var event = {
                name: value.summary || '',
                description: value.description || '',
                location: value.location || '',
                // if not provided the time use date & converts milliseconds to seconds by removing last three digits
                startTime: time.start || 0,
                endTime: time.end || 0,
                src: 'google'
                // venue: value.venue.name,
                // description: value.description || "",
              };
              events.push(event);
            }); 
            if (retrievedEvents.length < 250) {
              nextSyncTokenHandler.update(userID, 'google', data.nextSyncToken, function () {
                next(200, {events: events});
              });
            } else {
              next(200, {events: events});
            }
          }
        } catch (e) {
          next(500, e);
        }
      }
    }).auth(null, null, true, accessToken);
  }
};

exports.createEvent = function (accessToken, event, next) {
  request.post({url: baseURL + '/calendars/' + 'giselakottmeier%40gmail.com' + '/events', form: event}, function (err, resp, body) {
    if (err) {
      var errStatusCode = JSON.parse(err).error.code;
      next(errStatusCode);
    } else {
      next(200);
    }
  }).auth(null, null, true, accessToken);
};
