const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventTitle:  {
        type: String,
        required: true
    },
    eventType:   {
        type: String,
        required: true
    },
    eventDescription:    {
        type: String,
        required: true
    },
    creator:   {
        type: String,
        required: true
    },
    eventVenue:   {
        type: String,
        required: true
    },
    // poster: {
    //     type:   String,
    //     required:   true
    // },
    eventDate:   {
        type: Date,
        required: true
    },
    eventTime:   {
        type: String,
        required: true
    },
    dateCreated:    {
        type: Date,
        default: Date.now
    }
});

const Event = module.exports = mongoose.model('events', eventSchema);

// Fetch events
module.exports.getEvents = function(callback, limit)   {
    Event.find(callback).limit(limit);
}

// Fetch single event
module.exports.getEventByID = function(id, callback)    {
    Event.findById(id, callback);
}
