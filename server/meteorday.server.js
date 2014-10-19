// Methods
Meteor.methods({
    addMeetupEvent: function(params) {
        if (Meteor.userId() && (params.userId == Meteor.userId())) {
            if (params._id) {
                //Most likely won't need the meetup update part..
                Meetups.update({
                    _id: params._id
                }, {
                    $set: {
                        meetupId: params.meetupId,
                        location: params.location,
                        meetupId: params.meetupId,
                        url: params.meetupUrl,
                        userId: Meteor.userId()
                    }
                });
            }
            else {
                Meetups.insert({
                    region: params.region,
                    location: params.location,
                    meetupId: params.meetupId,
                    url: params.meetupUrl,
                    userId: Meteor.userId()
                });
            }
        }
    }
});

// Publications
Meteor.publish("meetups", function() {
    return Meetups.find({});
});


// Access control
Meteor.users.allow({
    'insert': function(userId, doc) {
        //Only admin account. No user accounts
        return false;
    },

    'update': function(userId, doc, fields, modifier) {
        return userId && userId === doc._id;
    }
});

Meetups.allow({
    'insert': function(userId, doc) {
        return userId && userId === doc._id;
    },
    'update': function(userId, doc, fields, modifier) {
        return userId && userId === doc._id;
    },
    'remove': function(userId, doc) {
        return userId && (doc.userId == userId)
    }
});
