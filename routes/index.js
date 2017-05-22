var express = require('express');
var passport = require('passport');
var router = express.Router();

var request = require('request')

var User = require('../models/user');
var Community = require('../models/community');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

router.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

router.get('/communities', isLoggedIn, function(req, res) {
  User
  .findOne({_id: req.user._id }) // all
  .populate('communities')
  .exec(function (err, user) {
    if (err) return handleError(err);
    res.render('communities/index.ejs', { user: user });

    // Stores with items
  });
});


router.get('/communities/new', isLoggedIn, function(req, res) {
  res.render('communities/new.ejs', { user: req.user });
});


router.post('/communities', isLoggedIn, function(req, res) {
  var community = new Community(req.body)

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
});


router.get('/communities/:slack_subdomain/edit', isLoggedIn, function(req, res) {
  Community.findOne({slack_subdomain: req.params.slack_subdomain}, function(err, community) {
    //TODO: add some check if this slack is owned by the current user
    res.render('communities/edit.ejs', { user: req.user, community: community });
  })
});

router.post('/communities/:slack_subdomain', isLoggedIn, function(req, res) {
  var community = new Community(req.body)

  //TODO: add some check if the mutation is allowed
  var piet = Object.assign(req.body, { published: (req.body.published == 'on'), active: (req.body.active == 'on')})

  Community.findOneAndUpdate({ slack_subdomain: req.params.slack_subdomain }, piet, {}, console.log)

  res.redirect('/communities');
});


router.get('/communities/:slack_subdomain', isLoggedIn, function(req, res) {
  Community.findOne({slack_subdomain: req.params.slack_subdomain}, function(err, community) {
    res.render('communities/show.ejs', { user: req.user, community: community });
  })
});


router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/communities',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/communities',
  failureRedirect: '/login',
  failureFlash: true,
}));

// router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
//
// router.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirect: '/profile',
//   failureRedirect: '/',
// }));
//
// router.get('/auth/twitter', passport.authenticate('twitter'));
//
// router.get('/auth/twitter/callback', passport.authenticate('twitter', {
//   successRedirect: '/profile',
//   failureRedirect: '/',
// }));
//
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
//
// router.get('/auth/google/callback', passport.authenticate('google', {
//   successRedirect: '/profile',
//   failureRedirect: '/',
// }));

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
