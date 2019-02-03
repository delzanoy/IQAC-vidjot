const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        bcrypt: true
    },
    type: {
        type: String,
        required: true
    },
    secretToken:    {
        type:   String
    },
    confirmed:  {
        type: Boolean,
        default: false
    },
    isAdmin:  {
        type: Boolean,
        default: false
    },
    dateJoined: {
        type: Date,
        default: Date.now
    }
});

const User = module.exports = mongoose.model('users', userSchema);

// Fetch users
module.exports.getUsers = function (callback, limit) {
    User.find(callback).limit(limit);
}

// Fetch single user by username
module.exports.getUserByEmail = function (email, callback) {
    var query = { email: email };
    User.find(query, callback);
}

// Fetch user by user id
module.exports.getUserById = function (id, callback) {
    var query = { id: id };
    User.find(query, callback);
}




// Register Students
module.exports.registerStudent = function (newUser, newStudent, callback) {

}

// Register Faculty
module.exports.registerFaculty = function (newUser, newFaculty, callback) {

}
