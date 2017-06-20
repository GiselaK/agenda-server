var request = require('request');
var meetupAuth;
var redirectUri = require('./controllersData').redirect_uri;

if (process.env.NODE_ENV === 'dev') {
  meetupAuth = require('../apikeys').meetup;
} else {
  meetupAuth = process.env.meetup;
}
exports.getRefreshToken = function (code, next) {
  request.post({url: 'https://secure.meetup.com/oauth2/access', form: {client_id: meetupAuth.client_id, client_secret: meetupAuth.client_secret, grant_type: 'authorization_code', redirect_uri: redirectUri, code: code}}, function (err, resp, body) {
    if (err) {
      console.log(err);
    } else {
      var parsedBody = JSON.parse(body);
      exports.getEvents(parsedBody.accessToken, next);
    }
  });
};

exports.getEvents = function (accessToken, next) {
  request.get({url: 'https://api.meetup.com/self/events/?&sign=true&photo-host=public&page=20&access_token=' + accessToken}, function (err, resp, body) {
    if (err) {
      console.log(err);
    } else {
      var retrievedEvents = JSON.parse(body);
      var response = {events: [], calSrc: 'Meetup'};
      retrievedEvents.forEach(function (event, index) {
        var newEvent = {
          name: event.name,
          description: event.description,
          startTime: event.time / 1e3, // converts milliseconds to seconds by removing last three digits
          endTime: (event.time + event.duration) / 1e3 || 0, // converts milliseconds to seconds by removing last three digits
          venue: event.venue.name,
          src: 'meetup'
          // duration: event.duration || 0
        };
        response.events.push(newEvent);
      });
      next(response);
    };
  });
};
