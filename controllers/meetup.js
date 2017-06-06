var request = require("request");
var meetupAuth = require("../apikeys.js").meetup;
var redirect_uri = require("./controllersData").redirect_uri;

exports.getRefreshToken = function (code, next) {
	request.post({url: 'https://secure.meetup.com/oauth2/access', form: {client_id: meetupAuth.client_id, client_secret: meetupAuth.client_secret, grant_type: 'authorization_code', redirect_uri: redirect_uri, code: code }}, function (err, resp, body) {
		var parsedBody = JSON.parse(body);
		exports.getEvents(parsedBody.access_token, next);
	});
};

exports.getEvents = function (access_token, next) {
	request.get({url: 'https://api.meetup.com/self/events/?&sign=true&photo-host=public&page=20&access_token=' + access_token}, function (err, resp, body) {
		var retrievedEvents = JSON.parse(body)
		var response = {events: [], calSrc: "Meetup"}
		retrievedEvents.forEach(function (event, index) {
			var event = {
				name: event.name,
				description: event.description,
				startTime: event.time/1e3, // converts milliseconds to seconds by removing last three digits
				endTime: (event.time+event.duration)/1e3 || 0, // converts milliseconds to seconds by removing last three digits
				venue: event.venue.name,
				src: "meetup"
				// duration: event.duration || 0
			}
			response.events.push(event)
		})
		next(response)
	})
}