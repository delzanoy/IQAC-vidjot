const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Include models
require('../models/User');
const User = mongoose.model('users');
require('../models/Student');
const Student = mongoose.model('students');
require('../models/Faculty');
const Faculty = mongoose.model('faculties');
require('../models/Event');
const Event = mongoose.model('events');

/* GET home page. */
router.get('/', function (req, res, next) {
  Event.find({})
    .sort({
      dateCreated: 'desc'
    })
    .then(events => {
      User.find({})
        .sort({
          dateJoined: 'desc'
        })
        .then(users =>  {
          res.render('index', {
            events: events,
            users:  users
          });
        })


    });
});

module.exports = router;