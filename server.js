var slackin = require('slackin').default

var vhost = require('vhost')

var app = require('./app');

var User = require('./models/user');

var express = require('express');

var domain = process.env.DOMAIN || 'localhost'

var app = express()

app.listen(3004)



var launcher = express()

// respond with "hello world" when a GET request is made to the homepage
launcher.get('/communities/:community/startup', function (req, res) {
  User.allCommunities(function(err, res) {
    res.forEach(startup)
  })

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
  res.send("ok")
})

app.use(vhost('launcher.' + domain, launcher))
