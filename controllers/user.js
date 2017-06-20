var User = require('../database/user.js');

exports.createUser = function (data, next) {
  var currentDate = Date.now();
  var sampleData = {google: {refresh_token: 'blah', last_updated: currentDate}};
  User.create(sampleData, function (err, user) {
    if (!err) {
      next(err, {userID: user._id});
    }
  });
};
