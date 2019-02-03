const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    firstName:  {
        type: String,
        required: true
    },
    LastName:    {
        type: String,
        required: true
    },
    email:   {
        type: String,
        required: true
    },
    branch:   {
        type: String,
        required: true
    },
    events: [{
        eventId:    {type: [mongoose.Schema.Types.ObjectId]},
        eventTitle:  {type: String}
    }]
});

const Faculty = module.exports = mongoose.model('faculties', facultySchema);

// Fetch faculty
module.exports.getFaculty = function(callback, limit)   {
    User.find(callback).limit(limit);
}

// Fetch single faculty
module.exports.getFacultyByEmail = function(email, callback)    {
    var query = {email: email};
    User.find(query, callback);
}

// Fetch events by user
module.exports.getEventByEmail = function(email, callback)  {
    Event.find(email, callback);
}