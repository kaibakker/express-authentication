var express = require('express');
var router = express.Router();

var request = require('request')

var User = require('../models/user');
var Community = require('../models/community');

router.get('/', isLoggedIn, function(req, res) {
  User
  .findOne({_id: req.user._id }) // all
  .populate('communities')
  .exec(function (err, user) {
    if (err) return handleError(err);
    res.render('communities/index.ejs', { user: user });

    // Stores with items
  });
});


router.get('/new', isLoggedIn, function(req, res) {
  res.render('communities/new.ejs', { user: req.user });
});


router.post('/', isLoggedIn, function(req, res) {
  var community = new Community(req.body)
  request('https://slack.com/api/team.info?token=' + community.slack_api_token, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', typeof body); // Print the HTML for the Google homepage.
    var object = JSON.parse(body)

    if(object.ok) {
      community.slack_subdomain = object.team.domain
      console.log(community)
      community.save(function(err) {
        var user = req.user
        user.communities.push(community)
        user.save(function(err) {
          if(!err) {
            request('http://launcher.enterslack.com/communities/' + community.slack_subdomain + '/startup', function (error, response, body) {
              console.log('error:', error); // Print the error if one occurred
              console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              console.log('body:', body); // Print the HTML for the Google homepage.
            });
          }
        })
      })
      res.redirect('/communities');
    } else {
      res.redirect('back');
    }
  });

});


router.get('/:slack_subdomain/edit', isLoggedIn, function(req, res) {
  Community.findOne({slack_subdomain: req.params.slack_subdomain}, function(err, community) {
    //TODO: add some check if this slack is owned by the current user
    res.render('communities/edit.ejs', { user: req.user, community: community });
  })
});

router.post('/:slack_subdomain', isLoggedIn, function(req, res) {
  var community = new Community(req.body)

  //TODO: add some check if the mutation is allowed
  var piet = Object.assign(req.body, { published: (req.body.published == 'on'), active: (req.body.active == 'on')})

  Community.findOneAndUpdate({ slack_subdomain: req.params.slack_subdomain }, piet, {}, console.log)

  res.redirect('/communities');
});


router.get('/:slack_subdomain', isLoggedIn, function(req, res) {
  Community.findOne({slack_subdomain: req.params.slack_subdomain}, function(err, community) {
    res.render('communities/show.ejs', { user: req.user, community: community });
  })
});


router.get('/:slack_subdomain/integration', isLoggedIn, function(req, res) {
  Community.findOne({slack_subdomain: req.params.slack_subdomain}, function(err, community) {
    var integrations = [{
      title: 'Link with URL',
      html: '<a class="ui tiny button" href="http://' + community.slack_subdomain + '.enterslack.com">Join ' + community.slack_subdomain + '\'s slack</a>'
    },{
      title: 'SVG Badge',
      html: '<script async defer src="http://' + community.slack_subdomain + '.enterslack.com/slackin.js"></script>'
    },{
      title: 'JS Badge',
      html: '<a href="http://' + community.slack_subdomain + '.enterslack.com"><img src="http://' + community.slack_subdomain + '.enterslack.com/badge.svg"></a>'
    }]
    res.render('communities/integration.ejs', { user: req.user, community: community, integrations: integrations });
  })
});

module.exports = router;
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
