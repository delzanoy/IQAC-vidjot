const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const mongoXlsx = require('mongo-xlsx');
const mongoXlsx = require('mongo-xlsx');
const multer = require('multer');
const path = require('path');
const multerUpload = require('../helpers/multerUpload');
const moment = require('moment');
const fs = require('fs');
const { ensureAuthenticated } = require('../helpers/auth');

require('../models/Event');
const Event = mongoose.model('events');

// // /* GET events page. */
router.get('/', function(req, res, next) {
  Event.find({})
    .sort({
      dateCreated: 'desc'
    })
    .then(events => {
      res.render('events/index', {
        events: events
      });
    });
});

// Router to serve search
router.post('/filter/title', ensureAuthenticated, function(req, res, next) {
  Event.find({
    eventTitle: req.body.eventTitleFilter
  }).then(event => {
    res.render('events/filter/title', {
      event: event
    });
    console.log(event);
  });
});

// Router to generate report
router.post('/report', ensureAuthenticated, function(req, res, next) {
  // Event.find()
  // .then(event =>  {
  //   console.log(event);
  //   /* Generate automatic model for processing (A static model should be used) */
  //   let model = mongoXlsx.buildDynamicModel(event);

  //   /* Generate Excel */
  //   mongoXlsx.mongoData2Xlsx(event, model, function (err, data) {
  //     console.log('File saved at:', data.fullPath);
  //   });
  //   res.redirect('/');
  // })
  // .catch(err => {
  //   console.log(err);
  // });

  let data = [
    {
      name: 'Peter',
      lastName: 'Parker',
      isSpider: true
    },
    {
      name: 'Remy',
      lastName: 'LeBeau',
      powers: ['kinetic cards']
    }
  ];

  /* Generate automatic model for processing (A static model should be used) */
  let model = mongoXlsx.buildDynamicModel(data);

  /* Generate Excel */
  mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
    console.log('File saved at:', data.fullPath);
  });
  res.redirect('/');
});
var evtID = '';
//  Route to fetch an event

router.use('/details/:id', (req, res, next) => {
  evtID = req.params.id;
  next();
});

router.get('/details/:id', function(req, res, next) {
  console.log('detail running');
  evtID = req.params.id;
  Event.getEventByID(
    {
      _id: req.params.id
    },
    function(error, eventName) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        res.render('events/details', {
          event: eventName
        });
      }
    }
  );
});

//  Route to Post event page
router.get('/add', ensureAuthenticated, function(req, res, next) {
  res.render('events/add');
});

//  Route to get upload page
router.get('/upload', ensureAuthenticated, function(req, res) {
  res.render('events/upload');
});

//  Route to post upload page
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `./public/uploads/${req.params.id}`);
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  }
});

function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|bmp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images only'));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('myImage');

router.post('/upload/:id', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      res.render('events/upload', {
        msg: 'Some error Occurred.'
      });
    } else {
      if (req.file == undefined) {
        console.log('Undefined');
        res.render('events/upload', {
          msg: 'Error: no file selected'
        });
      } else {
        console.log('File found');
        res.render(`events/upload`, {
          msg: 'File Uploaded',
          file: `../../uploads/${req.params.id}/${req.file.filename}`
        });
        const filePath = `./public/uploads/${req.params.id}`;
        const fName = req.file.filename;

        fs.mkdir(filePath + `/previews`, err => {
          fs.copyFile(
            filePath + `/${fName}`,
            filePath + `/previews/${fName}`,
            err => {
              if (!err) {
                console.log('Copied');
              } else {
                console.log('Error');
              }
            }
          );
        });

        fs.mkdir(filePath + `/thumbs`, err => {
          fs.copyFile(
            filePath + `/${fName}`,
            filePath + `/thumbs/${fName}`,
            err => {
              if (!err) {
                console.log('Copied');
              } else {
                console.log(err);
              }
            }
          );
        });
      }
    }
  });
});

//  Route to Post new events
router.post('/add', ensureAuthenticated, (req, res) => {
  let errors = [];
  if (!req.body.eventTitle) {
    errors.push({
      text: 'Please add a Title.'
    });
  }
  if (!req.body.eventType) {
    errors.push({
      text: 'Please select a Type.'
    });
  }
  if (!req.body.eventDate) {
    errors.push({
      text: 'Please select a Date.'
    });
  }
  if (!req.body.eventTime) {
    errors.push({
      text: 'Please select a Time.'
    });
  }
  if (!req.body.eventVenue) {
    errors.push({
      text: 'Please add a Venue.'
    });
  }
  if (!req.body.eventDescription) {
    errors.push({
      text: 'Please add some Desription.'
    });
  }
  if (errors.length > 0) {
    res.render('events/add', {
      errors: errors,
      eventTitle: req.body.eventTitle,
      eventType: req.body.eventType,
      eventDate: req.body.eventDate,
      eventTime: req.body.eventTime,
      eventVenue: req.body.eventVenue,
      eventDescription: req.body.eventDescription
    });
  } else {
    let momentDate = moment().format('DD-MMMM-YYYY', 'hh:mma'); //moment([2010, 1, 14, 15, 25, 50, 125]);
    momentDate = new Date(req.body.eventDate);

    const newUser = {
      eventTitle: req.body.eventTitle,
      eventType: req.body.eventType,
      eventDate: momentDate,
      eventTime: req.body.eventTime,
      eventVenue: req.body.eventVenue,
      eventDescription: req.body.eventDescription,
      creator: req.user.id
    };
    new Event(newUser)
      .save()
      .then(event => {
        req.flash('success_msg', 'Event Added.');

        fs.mkdir('./public/uploads/' + event._id, () => {
          console.log('event folder created.');
        });

        res.redirect('/events/myevents');
      })
      .catch(() => {
        res.send('error');
      });
  }
});
let imagePath = './public/uploads/';
router.use(
  '/images/:id',
  (req, res, next) => {
    evtID = req.params.id;
    console.log('id', evtID);
    next();
  }
);
// router.use(
//   `/images/:id`,
//   Gallery(imagePath + id, {
//     title: 'Uploaded Images'
//   })
// );

router.get('/myevents', ensureAuthenticated, (req, res) => {
  Event.find({
    creator: req.user.id
  })
    .sort({
      dateCreated: 'desc'
    })
    .then(events => {
      res.render('events/user', {
        events: events
      });
    });
});

//  Route to edit an event
router.get('/myevents/edit/:id', ensureAuthenticated, function(req, res) {
  Event.findOne({
    _id: req.params.id
  }).then(event => {
    if (event.creator != req.user.id) {
      req.flash('error_msg', 'Not Authorized.');
      res.redirect('/events');
    } else {
      res.render('events/edit', {
        event: event
      });
    }
  });
});

// Route to process edit form
router.put('/myevents/edit/:id', ensureAuthenticated, (req, res) => {
  var momentDate = moment().format('DD-MMMM-YYYY', 'hh:mma'); //moment([2010, 1, 14, 15, 25, 50, 125]);
  momentDate = new Date(req.body.eventDate);
  Event.findByIdAndUpdate(req.params.id, {
    eventTitle: req.body.eventTitle,
    eventType: req.body.eventType,
    eventDate: momentDate,
    eventTime: req.body.eventTime,
    eventVenue: req.body.eventVenue,
    eventDescription: req.body.eventDescription
  })
    .then(() => {
      req.flash('success_msg', 'Event Updated.');
      res.redirect('/events/myevents');
    })
    .catch
    // res.redirect(404, '/events/myevents') // ERROR CODE
    ();
});

// Route to delete an event
router.delete('/myevents/delete/:id', ensureAuthenticated, (req, res) => {
  Event.findOne({
    _id: req.params.id
  }).then(event => {
    if (event.creator != req.user.id) {
      req.flash('error_msg', 'Not Authorized.');
      res.redirect('/events');
    } else {
      Event.remove({
        _id: req.params.id
      })
        .then(() => {
          req.flash('success_msg', 'Event deleted.');
          res.redirect('/events/myevents');
        })
        .catch
        // res.redirect(404, '/events/myevents') // ERROR CODE
        ();
    }
  });
});

router.get('/gallery', function() {
  const options = {
    title: 'Photo Gallery'
  };
  const app = express();
  app.use('/', Gallery('../public/images/', options));
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
