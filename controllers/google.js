var request = require("request");
var googleAuth = process.env.google;
var baseURL = "https://www.googleapis.com/calendar/v3";
var redirect_uri = require("./controllersData").redirect_uri;
var timeConverter = require("../helpers/timeConverter");
var refreshTokenHandler = require('../helpers/refreshTokens');
var Promise = require("bluebird");

exports.getRefreshToken = function (userID, code, next) {
	var requestURL = "https://www.googleapis.com/oauth2/v4/token";
	request.post({url: requestURL, form: {client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: "authorization_code", redirect_uri: redirect_uri, code: code }}, function (err, resp, body) {
		if (!err) {
			var parsedBody = JSON.parse(body);
			refreshTokenHandler.saveRefreshToken(userID, "google", parsedBody.refresh_token, next);
		} else {
			console.log(err);
		}
	})
};

exports.retrieveAccessToken = function (userID, callback) {
	var requestURL = "https://www.googleapis.com/oauth2/v4/token";

	function getAccessToken (refresh_token) {
		request.post({url: requestURL, form: {refresh_token: refresh_token, client_id: googleAuth.client_id, client_secret: googleAuth.client_secret, grant_type: "refresh_token"}}, function (err, resp, body) {
			if (!err) {
				var access_token = JSON.parse(body).access_token;	
				callback(access_token);
			} else {
				console.log(err);
			}
		})
	}
	
	refreshTokenHandler.retrieveRefreshToken(userID, "google", getAccessToken)
}
exports.getCals = function (access_token, next) {
	request.get({url: baseURL + "/users/me/calendarList"}, function (err, resp, body) {
		if (!err) {
			var retrievedCals = JSON.parse(body).items;
			var result = retrievedCals.map(function (retrievedCal, index) {
				var calResult = {};
				// keys returned from api call :
				// kind, etag, id, summary, timeZone, colorId, backgroundColor, foregroundColor, accessRole, defaultReminders
				calResult["name"] =  retrievedCal["summary"];
				calResult["id"] = retrievedCal["id"];
				return calResult;
			});
			next(200,{calendars: result});
			// Promise.all(retrievedCals.map(function(cal, index) {
			//     return exports.getEvents(access_token, cal.id).then(function (newEvents) {
			//     	if (newEvents) {
			// 	    	response.events = response.events.concat(newEvents);
			//     	}
			//     });
			// })).then(function () {
			// 	next(response);
			// });

		} else {
			console.log(err);
		}
	}).auth(null, null, true, access_token);
};
// exports.getProfile = function (access_token, next) {
// 	request.get({url: "https://www.googleapis.com/plus/v1/people/me"}, function (err, resp, body) {
// 		var body = body ? JSON.parse(body): undefined;
// 		if (body) {
// 			var id = body.id;
// 			if (err) {
// 				var errStatusCode = JSON.parse(err).error.code;
// 				next(errStatusCode);
// 			} else {
// 				console.log("id:", body);
// 				next(200);
// 			}
			
// 		} else {
// 			next(400);
// 		}
// 	}).auth(null, null, true, access_token);
// }
exports.getEvents = function (access_token, calID, next) {
	var getTimeMin = function () {
		var pastDate = new Date();
		var daysBack = 7;
		pastDate.setDate(pastDate.getDate() - daysBack);
		return pastDate;
	}
	var getTimeMax = function () {
		var futureDate = new Date();
		var monthsAhead = 1;
		futureDate.setMonth(futureDate.getMonth() + 1);
		return futureDate;
	}
	var timeMin = timeConverter.convertToRFC339(getTimeMin())
	var timeMax = timeConverter.convertToRFC339(getTimeMax());
	request.get({url: baseURL + "/calendars/" + calID + "/events?timeMax=" + timeMax + "&timeMin=" + timeMin}, function(err, resp, body) {
		var events = [];
		try {
			var retrievedEvents = JSON.parse(body).items;
			retrievedEvents.forEach(function (value, index) {
				var time = {}
				if (value.start) {
					var RFC339Time = value.start.dateTime || value.start.date;
					time.start = timeConverter.RFC3339ToUTC(RFC339Time)/1e3
				}
				if (value.end) {
					var RFC339Time = value.end.dateTime || value.end.date;
					time.end = timeConverter.RFC3339ToUTC(RFC339Time)/1e3
				}
				var event = {
					name: value.summary || "",
					description: value.description || "",
					location: value.location || "",
					// if not provided the time use date & converts milliseconds to seconds by removing last three digits
					startTime: time.start || 0, 
					endTime: time.end || 0,
					src: "google"
					// venue: value.venue.name,
					// description: value.description || "",
				}
				events.push(event);
			});
			next(200, {events: events});
		} catch (e) {
			next(500, e);
		}
	}).auth(null, null, true, access_token)
}

// exports.createEvent = function (access_token, event, next) {
// 	request.post({url: baseURL + "/calendars/" + "giselakottmeier%40gmail.com" + "/events", form: event}, function (err, resp, body) {
// 		if (err) {
// 			var errStatusCode = JSON.parse(err).error.code
// 			next(errStatusCode)
// 		} else {
// 			next(200)
// 		}
// 	}).auth(null, null, true, access_token);
// }

