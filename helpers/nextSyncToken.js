var User = require('../database/user.js');

exports.update = function (userID, source, nextSyncToken, next) {
  var update = {};
  console.log("args:", arguments)
  update[source] = {next_sync_token: nextSyncToken, last_updated: Date.now()};
  User.findByIdAndUpdate(userID, update, function (err, resp) {
    if (!err) {
      next(200);
    } else {
      console.log(err)
    }
  });
};

exports.retrieve = function (userID, source, next) {
  User.findById(userID, function (err, user) {
    if (!err) {
      console.log("retrieveSyncToken:", user[source].next_sync_token)
      next(user[source].next_sync_token);
    } else {
      console.log(err)
    }
  });
};
