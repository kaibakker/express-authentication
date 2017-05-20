var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
  },
  communities : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }]
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
