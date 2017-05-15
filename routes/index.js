var express = require('express');
var passport = require('passport');
var router = express.Router();

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
  res.render('communities/index.ejs', { user: req.user });
});

router.get('/communities/new', isLoggedIn, function(req, res) {
  res.render('communities/new.ejs', { user: req.user });
});

router.get('/communities/:slack_domain', isLoggedIn, function(req, res) {
  res.render('profile.ejs', { user: req.user });
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
