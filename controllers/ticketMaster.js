var request = require('request');
var ticketMasterAuth;
var redirectURI = require('./controllersData').redirect_uri;

if (process.env.NODE_ENV === 'dev') {
  ticketMasterAuth = require('../apikeys').ticketMaster;
} else {
  ticketMasterAuth = process.env.ticketMaster;
}

exports.getRefreshToken = function (code, next) {
  request.post({url: 'https://oauth.ticketmaster.com/oauth/token', form: { client_id: ticketMasterAuth.client_id, client_secret: ticketMasterAuth.client_secret, grant_type: 'authorization_code', redirect_uri: redirectURI, code: code }}, function (err, resp, body) {
    if (err) {
      console.log(err);
    } else {
      var parsedBody = JSON.parse(body);
      exports.getEvents(parsedBody.access_token, next);
    }
  });
};

exports.getEvents = function (accessToken, next) {
  request.get({url: '' + accessToken}, function (err, resp, body) {
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
          src: 'ticketmaster'
          // duration: event.duration || 0
        };
        response.events.push(newEvent);
      });
      next(response);
    }
  });
};
