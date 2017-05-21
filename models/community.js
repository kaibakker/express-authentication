var mongoose = require('mongoose');

var communitySchema = mongoose.Schema({
  active: { type: Boolean, default: true },
  published: { type: Boolean, default: true },
	slack_interval: Number,
	slack_subdomain: String,
	slack_api_token: String,
});


communitySchema.statics.allCommunities = function(done) {
	this.find({}, done);
};


module.exports = mongoose.model('Community', communitySchema);
