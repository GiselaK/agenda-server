var User = require('../database/user.js');

exports.update = function (userID, source, nextSyncToken, next) {
  var update = {};
  User.findById(userID, function (err, user) {
    if (!err) {
      user[source].next_sync_token = nextSyncToken;
      user[source].last_updated = new Date();
      user.markModified(source);
      user.save(function (err, user){
        if (err) {
           console.log("Update Sync Token From Mongo Error:", err)
           next(err);
        } else {
          next(null, user.next_sync_token);
        }
      })
    } else {
      next(err);
      console.log("Find User in Sync Token From Mongo Error:", err)
    }
  });
};

exports.retrieve = function (userID, source, next) {
  User.findById(userID, function (err, user) {
    if (!err) {
      next(user[source].next_sync_token);
    } else {
      console.log("Retrieve Sync Token From Mongo Error:", err)
    }
  });
};
