const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mailer = require('../helpers/mailer');

// Include models
require('../models/User');
const User = mongoose.model('users');
require('../models/Student');
const Student = mongoose.model('students');
require('../models/Faculty');
const Faculty = mongoose.model('faculties');

// Get user registration
router.get('/signup', function (req, res) {
  res.render('users/signup');
});

// Get Faculty registration
router.get('/signupFaculty', function (req, res) {
  res.render('users/signupFaculty');
});

// Login Form post
router.post('/login', (req, res, next) => {
  User.findOne({
      email: req.body.email
    })
    .then((user) => {
      if (user.confirmed) {
        passport.authenticate('local', {
          successRedirect: '/events',
          failureRedirect: '/',
          failureFlash: true
        })(req, res, next);
      } else {
        req.flash('error_msg', 'Please activate your account. Check your email.');
        res.redirect('/');
      }
    });
});

// Forgot password get
router.get('/forgotPassword', function (req, res) {
  res.render('users/forgotPassword');
});

// Forgot password post
router.post('/forgotPassword', function (req, res) {
  let errors = [];
  if (req.body.email <= 0) {
    errors.push({
      text: 'Email is required'
    });
  }
  if (errors.length > 0) {
    res.render('users/forgotPassword', {
      errors: errors
    });
  } else {
    User.findOne({
      email: req.body.email
    }, (err, user) => {
      if (!user) {
        req.flash('error_msg', 'No user with that email address');
        res.redirect('/users/forgotPassword');
      } else {
        jwt.sign({
          user
        }, 'secretkey', (err, token) => {
          secretToken = token;
          User.findOneAndUpdate({
              _id: user._id
            }, {
              secretToken: secretToken
            })
            .then((user) => {
              const mailOptions = {
                from: '<IQAC> delanoykunil@gmail.com', // sender address
                to: user.email, // list of receivers
                subject: 'Reset your password.', // Subject line
                html: `<a href="http://localhost:5000/users/forgotPassword/${secretToken}">Click here</a>` // plain text body
              };
              mailer.sendMail(mailOptions);
              req.flash('success_msg', 'Please find a link in your email to reset the password.');
              res.redirect('/');
            })
            .catch(err => console.log(err));
        });
      }
    });
  }
});

//  Forgot password get process
router.get('/forgotPassword/:secretToken', (req, res) => {
  res.render('users/resetPassword', {
    secretToken: req.params.secretToken
  });
});

//  Forgot password post process
router.post('/forgotPassword/:secretToken', (req, res) => {
  let errors = [];
  let newPassword = '';
  if (req.body.password != req.body.repassword) {
    errors.push({
      text: 'Passwords do\'nt match'
    });
  }
  if (req.body.password.length < 6) {
    errors.push({
      text: 'Password must be at least 6 characters'
    });
  }
  if (errors.length > 0) {
    res.redirect('/', {
      errors: errors
    });
  } else {
    bcrypt.genSalt(18, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        newPassword = hash;
        User.findOneAndUpdate({
            secretToken: req.params.secretToken
          }, {
            secretToken: '',
            password: newPassword
          })
          .then(user => {
            req.flash('success_msg', 'Your password has been successfully changed.');
            res.redirect('/');
          });
      })
    });
  }
});

router.post('/invite/student', function (req, res, next) {
  req.flash('success_msg', 'Invitation sent.');
  const mailOptions = {
    from: '<IQAC> delanoykunil@gmail.com', // sender address
    to: req.body.inviteStudent, // list of receivers
    subject: 'Invitation to SPIT Events.', // Subject line
    html: `<a href="http://localhost:5000/users/signup">Click here</a>` // plain text body
  };
  mailer.sendMail(mailOptions);
  res.redirect('/');
});

router.post('/invite/faculty', function (req, res, next) {
  req.flash('success_msg', 'Invitation sent.');
  const mailOptions = {
    from: '<IQAC> delanoykunil@gmail.com', // sender address
    to: req.body.inviteFaculty, // list of receivers
    subject: 'Invitation to SPIT Events.', // Subject line
    html: `<a href="http://localhost:5000/users/signupFaculty">Click here</a>` // plain text body
  };
  mailer.sendMail(mailOptions);
  res.redirect('/');
});



// Activate user account
router.get('/activate/:secretToken', function (req, res, next) {
  // User.findOneAndUpdate({
  //   secretToken:  req.params.secretToken
  // }, { 
  //   confirmed: true,
  //   secretToken:  ''
  // }, null, (user) =>  {
  //     req.flash('success_msg', 'User has been activated. You may now log in.');
  //     res.redirect('/');
  // });
  User.findOneAndUpdate({
      secretToken: req.params.secretToken
    }, {
      confirmed: true,
      secretToken: ''
    })
    .then((user) => {
      req.flash('success_msg', 'User has been activated. You may now log in.');
      res.redirect('/');
    })
    .catch((error) => {
      req.flash('error_msg', 'User already activated or does\'nt exist.');
      res.redirect('/');
    });
});


// Register form post
router.post('/signup', function (req, res) {
  let errors = [];
  if (req.body.firstName.length <= 0) {
    errors.push({
      text: 'First name is required'
    });
  }

  if (req.body.lastName.length <= 0) {
    errors.push({
      text: 'Last name is required'
    });
  }

  if (req.body.type === 'student') {
    if (req.body.ernumber.length <= 0) {
      errors.push({
        text: 'Enrollment number is required'
      });
    }
  }

  if (req.body.email.length <= 0) {
    errors.push({
      text: 'Email is required'
    });
  }

  if (req.body.branch.length <= 0) {
    errors.push({
      text: 'Branch is required'
    });
  }

  if (req.body.password != req.body.repassword) {
    errors.push({
      text: 'Passwords do\'nt match'
    });
  }

  if (req.body.password.length < 6) {
    errors.push({
      text: 'Password must be at least 6 characters'
    });
  }

  if (errors.length > 0) {
    res.render('users/signup', {
      errors: errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      ernumber: req.body.ernumber
    });
  } else {
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered');
          res.redirect('/users/signup');
        } else {
          let secretToken = '';
          const newUser = new User({
            type: req.body.type,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(18, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  jwt.sign({
                    user
                  }, 'secretkey', (err, token) => {
                    secretToken = token;
                    User.findOneAndUpdate({
                        _id: user._id
                      }, {
                        secretToken: secretToken
                      })
                      .then((user) => {
                        const mailOptions = {
                          from: '<IQAC> delanoykunil@gmail.com', // sender address
                          to: user.email, // list of receivers
                          subject: 'Verify your account.', // Subject line
                          html: `<a href="http://localhost:5000/users/activate/${secretToken}">Click here</a>` // plain text body
                        };
                        mailer.sendMail(mailOptions);
                      })
                      .catch(err => console.log(err));
                  });
                  if (req.body.type === 'student') {
                    const newStudent = new Student({
                      firstName: req.body.firstName,
                      LastName: req.body.lastName,
                      email: req.body.email,
                      branch: req.body.branch,
                      ernumber: req.body.ernumber
                    });
                    newStudent.save();
                  }
                  if (newUser.type === 'faculty') {
                    const newFaculty = new Faculty({
                      firstName: req.body.firstName,
                      LastName: req.body.lastName,
                      email: req.body.email
                    });
                    newFaculty.save();
                  }
                  req.flash('success_msg', 'You are now registered, check your mailbox to verify your account.');
                  res.redirect('/');
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
            });
          });
        }
      });
  }
});

// Logout user
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have successfully logged out');
  res.redirect('/');
});

module.exports = router;