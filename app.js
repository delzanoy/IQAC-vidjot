const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const moment = require('moment');
const Handlebars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');
const db = require('./config/database');

HandlebarsIntl.registerWith(Handlebars);

const app = express();

// Initializing Routes
const indexRouter = require('./routes/index');
const contactRouter = require('./routes/contact');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');

// Passport config
require('./config/passport')(passport);

// Connect to mongoose
mongoose.connect(db.mongoURI, {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body-parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));


// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/events', eventsRouter);
app.use('/contact', contactRouter);
app.use('/users', usersRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});