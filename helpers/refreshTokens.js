var User = require("../database/user.js");

exports.saveRefreshToken = function (userID, source, refreshToken, callback) {
	var update = {};
	update[source] = {refresh_token: refreshToken, last_updated: Date.now()};
	User.findByIdAndUpdate(userID, update, function (err, resp){
		if (!err) {
			callback(200)
		}
	});	
}

exports.retrieveRefreshToken = function (userID, source, callback) {
	User.findById(userID, function (err, user) {
		if (!err) {
			callback(user[source].refresh_token);
		}
	})
}