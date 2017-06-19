var User = require("../database/user.js");

exports.createUser = function (callback) {
	var currentDate = Date.now();
	var newUser = User.create({}, function (err, user) {
	  if (!err) {
  		callback({userID: user._id});
	  }
  });
}