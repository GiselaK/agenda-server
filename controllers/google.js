// var Promise = require('bluebird');
var request = require('request');

var baseURL = 'https://www.googleapis.com/calendar/v3';

var googleAuth = JSON.parse(process.env.google);
var redirectURI = require('./controllersData').redirect_uri;
var timeConverter = require('../helpers/timeConverter');
var refreshTokenHandler = require('../helpers/refreshTokens');
var nextSyncTokenHandler = require('../helpers/nextSyncToken');
var tokenURL = 'https://www.googleapis.com/oauth2/v4/token';
var helpers = require('../helpers/javaScriptHelpers');




exports.getRefreshToken = function (userID, code, next) {
  request.post({url: tokenURL, form: {client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: 'authorization_code', redirect_uri: redirectURI, code: code}}, function (err, resp, body) {
    if (!err) {
      var parsedBody = JSON.parse(body);
      // helpers.log("refresh token:", parsedBody.refresh_token)
      refreshTokenHandler.saveRefreshToken(userID, 'google', parsedBody.refresh_token, next);
    } else {
      helpers.log("getRefreshToken Error:",err);
    }
  });
};

exports.retrieveAccessToken = function (userID, next) {
  
  function getAccessToken (refreshToken) {
    request.post({url: tokenURL, form: {refresh_token: refreshToken, client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: 'refresh_token'}}, function (err, resp, body) {
      if (!err) {
        var accessToken = JSON.parse(body).access_token;
        var expiration_date = JSON.parse(body).expires_in;
        // console.helpers.log(JSON.parse(body),"controller :44")
        // helpers.log("accessToken:",accessToken, "Expiration date:", expiration_date)
        if (accessToken){
        next(null, accessToken, expiration_date );
      } else {
        helpers.log("retrieveAccessToken Error:", err);
        next(err)
      }
      }
    });
  }
  refreshTokenHandler.retrieveRefreshToken(userID, 'google', getAccessToken);
};

exports.getCals = function (accessToken, next) {
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
      helpers.log("getCals Error:", err);
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
//        console.helpers.log("id:", body);
//        next(200);
//      }
//    } else {
//      next(400);
//    }
//  }).auth(null, null, true, access_token);
// }
exports.getEvents = function (userID, accessToken, calID, nextPage, next) {
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
  var url = baseURL + '/calendars/' + calID + '/events?' + 'maxResults=250';
  // var timeMax = timeConverter.convertToRFC339(getTimeMax());
  if (nextPage) {url += ("&pageToken=" + nextPage)};
  nextSyncTokenHandler.retrieve(userID, 'google', function (syncToken) {
    if (syncToken) {
      url+=('&syncToken=' + syncToken)
    }
    retrieveEventsRequest();
  });
  var retrieveEventsRequest = function () {
    helpers.log("go to google and retrieve events", "no data to be displayed")
    request.get({url: url}, function (err, resp, body) {
      if (err) {
        helpers.log("retrieveEventsRequest Error:", err, "Attempted URL:", url);
        helpers.log("access token:", accessToken)
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
            if (data.nextPageToken) {
              next(200, {events: events, nextPage: data.nextPageToken});

            } else {
              nextSyncTokenHandler.update(userID, 'google', data.nextSyncToken, function () {
                next(200, {events: events, nextPage: "undefined"});
              });
              
            }
          } else {
            helpers.log("no retrieved events", data)
          } 
        } catch (e) {
          helpers.log("cannot parse", e)
          next(500, e);
        }
      }
    }).auth(null, null, true, accessToken);
  }
};

exports.createEvent = function (accessToken, event, calID, next) {
  helpers.log("creating event!!!!!", event, typeof event)
  event = JSON.parse(event)
  helpers.log("parsed event:", event, typeof event)
  var endDate = new Date(event.endDate);
  var startDate = new Date(event.startDate);
  helpers.log("start:", startDate, "end:", endDate)
  var googleReqEvent = {end:{dateTime: timeConverter.convertToRFC339(endDate)}, start:{dateTime: timeConverter.convertToRFC339(startDate)}}
  helpers.log("req:", googleReqEvent);
  request.post({url: baseURL + '/calendars/' + calID + '/events', form: googleReqEvent}, function (err, resp, body) {
    if (err) {
      var errStatusCode = JSON.parse(err).error.code;
      helpers.log("Create google event error:", err )
      next(errStatusCode);
    } else {
      helpers.log("google body:", body)
      next(200);
    }
  }).auth(null, null, true, accessToken);
};
