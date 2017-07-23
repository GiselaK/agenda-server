var User = require('../database/user.js');
var google = require('../controllers/google');

exports.createUser = function (data, next) {
  var currentDate = Date.now();
  User.create({}, function (err, user) {
    if (!err) {
      next(err, {userID: user._id});
    }
  });
};

exports.retrieveAccessToken = function (userID, next) {
  User.findById(userID, function (err, user) {
    if (!err) {
      let expired = user.google.access_token.expiration_date < Date.now();
      if (user.google.access_token.token && !expired) {
        next(null, user.google.access_token.token);
      } else {
        google.retrieveAccessToken(userID, function (err, accessToken, expiration_date) {
          exports.saveAccessToken(userID, accessToken, expiration_date, next);
        });
      }
    } else {
      next(err);
    }
  })
};

exports.saveAccessToken = function (userID, accessToken, expirationDate, next) {
  console.log("Accesstoken:", accessToken, "expiration:", expirationDate)
  User.findById(userID, function (err, user) {
    user.google.access_token.token = accessToken;
    user.google.access_token.expiration_date = expirationDate;
    user.markModified("google");
    user.save(function (err, user) {
      if(!err) {
        console.log("accesstoken saved to db: ", user.google.access_token.token)
        next(null, user.google.access_token.token)
      } else {
        next(err);
      }
    })
  })
};