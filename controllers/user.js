var User = require("../database/user.js");

exports.createUser = function (data, callback) {
	var currentDate = Date.now();
	var sampleData = {google: {refresh_token: "blah", last_updated: currentDate}};
	var user = new User(sampleData);
	user.save(function(err, user){
	  if (!err) {
		callback({userID: user._id});
	  }
	})
}