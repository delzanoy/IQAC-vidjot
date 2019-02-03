const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
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
    ernumber:   {
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

const Student = module.exports = mongoose.model('students', studentSchema);

// Fetch students
module.exports.getStudent = function(callback, limit)   {
    Student.find(callback).limit(limit);
}

// Fetch single student
module.exports.getStudentByEmail = function(email, callback)    {
    var query = {email: email};
    Student.find(query, callback);
}

// Fetch events by user
module.exports.getEventByEmail = function(email, callback)  {
    Event.find(email, callback);
}