var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
  },
  communities: [{
    active: { type: Boolean, default: true },
		slack_interval: Number,
		slack_subdomain: String,
		slack_api_token: String,
	}]




  // facebook: {
  //   id: String,
  //   token: String,
  //   email: String,
  //   name: String,
  //   username: String,
  // },
  // twitter: {
  //   id: String,
  //   token: String,
  //   displayName: String,
  //   username: String,
  // },
  // google: {
  //   id: String,
  //   token: String,
  //   email: String,
  //   name: String,
  // },
});


userSchema.statics.allCommunities = function(done) {
	this.find({}, function(err, users){
		var communities = users.map((user) => user.communities).reduce(
      function(a, b) {
        return a.concat(b);
      },
      []
    );

		return done(err, communities)
	});
};

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
