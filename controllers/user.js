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
      let expired = user.google.access_token && user.google.access_token.expiration_date ? user.google.access_token.expiration_date.getTime() < Date.now() : true;
      //If they have no access token which will happen the first time they log in, automatically sets expired to true and retrieves token from google
      if (user.google.access_token.token && !expired) {
        console.log("Retrieving access token from db")
        next(null, user.google.access_token.token);
      } else {
        console.log("Retrieving access token from google", "token:", user.google.access_token)
        google.retrieveAccessToken(userID, function (err, accessToken, expiration_date) {
          exports.saveAccessToken(userID, accessToken, expiration_date, next);
        });
      }
    } else {
      next(err);
    }
  })
};

exports.saveAccessToken = function (userID, accessToken, expiresIn, next) {
  console.log("Accesstoken:", accessToken, "expiration:", expiresIn)
  User.findById(userID, function (err, user) {
    user.google.access_token.token = accessToken;
    var expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expiresIn);
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