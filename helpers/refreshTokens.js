var User = require('../database/user.js');

exports.saveRefreshToken = function (userID, source, refreshToken, next) {
  var update = {};
  console.log("args:", arguments)
  update[source] = {refresh_token: refreshToken, last_updated: Date.now()};
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
      console.log("retrieveRefreshToken:", user[source].refresh_token)
      next(user[source].refresh_token);
    } else {
      console.log(err)
    }
  });
};
