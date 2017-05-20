var slackin = require('slackin').default

var vhost = require('vhost')

var app = require('./app');

var User = require('./models/user');
var Community = require('./models/community');

var express = require('express');

var domain = process.env.DOMAIN || 'localhost'

var app = express()

app.listen(process.env.PORT || 3004)

var launcher = express()


var startup = function(community) {
  if(community.active == true && community.slack_subdomain && community.slack_api_token) {
    var flags = {
      org: community.slack_subdomain,
      token: community.slack_api_token,
      interval: 100000,
    }
    var microservice = slackin(flags)

    app.use(vhost(community.slack_subdomain + '.' + domain, microservice.app))
  }
}
// respond with "hello world" when a GET request is made to the homepage
launcher.get('/communities/startup', function (req, res) {
  Community.find({}, function(err, communities) {
    communities.forEach(startup)
  })

  res.send("ok")
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
