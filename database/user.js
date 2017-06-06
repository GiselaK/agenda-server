var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var userSchema = new Schema({
    id: ObjectId,
    google: {refresh_token: String, last_updated: Date},
    facebook: {refresh_token: String, last_updated: Date},
    meetup: {refresh_token: String, last_updated: Date},
    name: String
});

module.exports = mongoose.model('User', userSchema);
