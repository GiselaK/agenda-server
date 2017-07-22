var User = require('../database/user.js');
var google = require('../controllers/google');

exports.createUser = function (data, next) {
  var currentDate = Date.now();
  var sampleData = {google: {refresh_token: 'blah', last_updated: currentDate}};
  User.create(sampleData, function (err, user) {
    if (!err) {
      next(err, {userID: user._id});
    }
  });
};

exports.retrieveAccessToken = function (userID, next) {
  User.findById(userID, function (err, user) {
    if (!err) {
      let expired = user.google.access_token.expiration_date < Data.now();
      if (user.google.access_token.token && !expired) {
        next(null, user.access_token);
      } else {
        google.retrieveAccessToken(userID, next);
      }
    } else {
      next(err);
    }
  })
};