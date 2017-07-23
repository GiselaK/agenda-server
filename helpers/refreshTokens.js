var User = require('../database/user.js');

exports.saveRefreshToken = function (userID, source, refreshToken, next) {
  var update = {};
  update[source] = {refresh_token: refreshToken};
  User.findByIdAndUpdate(userID, update, function (err, resp) {
    if (!err) {
      next(200);
    } else {
      console.log(err)
    }
  });
};

exports.retrieveRefreshToken = function (userID, source, next) {
  User.findById(userID, function (err, user) {
    if (!err) {
      next(user[source].refresh_token);
    } else {
      console.log("Retrive Refresh Token From Mongo Error:", err)
    }
  });
};
