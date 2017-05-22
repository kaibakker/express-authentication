var slackin = require('slackin').default

var vhost = require('vhost')

// var app = require('./app');

var mongoose = require('mongoose');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var User = require('./models/user');
var Community = require('./models/community');

var express = require('express');

var domain = process.env.DOMAIN || 'localhost'

var app = express()


var launcher = express()


var startup = function(community) {
  if(community.active == true && community.slack_subdomain && community.slack_api_token) {
    var flags = {
      org: community.slack_subdomain,
      token: community.slack_api_token,
      interval: 100000,
    }

    try {
       var microservice = slackin(flags)
       app.use(vhost(community.slack_subdomain + '.' + domain, microservice.app))
    } catch (e) {
       console.log(e.message, e.name); // pass exception object to err handler
    }
  }
}
// respond with "hello world" when a GET request is made to the homepage
Community.find({}, function(err, communities) {
  communities.forEach(startup)
})

launcher.get('/communities/:slack_subdomain/startup', function (req, res) {
  Community.findOne({ slack_subdomain: req.params.slack_subdomain }, function(err, community) {
    console.log(err, community)
    if(!err) {
      startup(community)
    }
  });

  res.send("ok")
})


app.use(vhost('launcher.' + domain, launcher))

app.listen(process.env.PORT || 3004)
