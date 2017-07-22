var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  id: ObjectId,
  google: {refresh_token: String, last_updated: Date, next_sync_token: String, access_token: {token: String, expiration_date: String }},
  facebook: {refresh_token: String, last_updated: Date},
  meetup: {refresh_token: String, last_updated: Date},
  name: String
});

module.exports = mongoose.model('User', userSchema);
