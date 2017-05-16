var subdomain = require('express-subdomain');

var slackin = require('slackin').default

var vhost = require('vhost')

var app = require('./app');

var User = require('./models/user');

var express = require('express');

var binder = express()

var domain = process.env.DOMAIN || 'localhost'

User.allCommunities(function(err, res) {
  res.forEach(function(community) {
    if(community.slack_subdomain && community.slack_api_token) {

      var flags = {
        org: community.slack_subdomain,
        token: community.slack_api_token,
        interval: 100000,
      }
      var slackin = slackin(flags)



      binder.use(vhost(community.slack_subdomain + '.' + domain, slackin.app))
    }

  })
})

binder.use(vhost('login.' + domain, app))

module.exports = binder;
