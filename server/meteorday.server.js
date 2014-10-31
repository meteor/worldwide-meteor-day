var list = ["getCategories", "getCheckins", "postCheckin", "getCities", "getOpenEvents", "getConcierge", "getEvents", "postEvent", "getEventComments", "postEventComment", "postEventCommentFlag", "getEventCommentLikes", "getEventRatings", "postEventRating", "getEventAttendance", "takeEventAttendance", "getEverywhereComments", "postEverywhereComment", "getEverywhereCommunities", "postEverywhereCommunity", "getEverywhereFollows", "getEverywhereFollowers", "postEverywhereFollow", "postEverywhereContainer", "getEverywhereContainers", "postEverywhereSeed", "postEverywhereEvent", "getEverywhereEvents", "postEverywhereRsvp", "getEverywhereRsvps", "getEverywhereSeeds", "getActivity", "getGroups", "getComments", "getMembers", "postMemberPhoto", "postMessage", "getOEMBed", "getOEMBed", "getPhotoComments", "postPhotoComment", "getPhotoAlbums", "getPhoto", "getPhotos", "postPhotoAlbum", "postPhoto", "getProfiles", "postProfiles", "postRSVP", "getRSVPs", "getOpenVenues", "getVenues", "getTopics"],
    MeetupMe = Meteor.npmRequire("meetup-api");
var api_key = Meteor.settings.meetup_api_key;
var meetup = new MeetupMe(api_key);
var AsyncMeetup = Async.wrap(meetup, list);



// Methods
Meteor.methods({
    MeetupAPI: function(endpoint, param) {
        switch (endpoint) {

            case "getRSVPs":
                return AsyncMeetup.getRSVPs(param);
                break
            case "getLeaders" :
                return AsyncMeetup.getProfiles(param);
                break
            default:

        }
    },
    addMeetupEvent: function(params) {
        if (Meteor.userId() && (params.userId == Meteor.userId())) {
            if (params._id) {
                //Most likely won't need the meetup update part..
                Meetups.update({
                    _id: params._id
                }, {
                    $set: {
                        meetupId: params.meetupId,
                        city: params.location,
                        meetupId: params.meetupId,
                        url: params.meetupUrl,
                        userId: Meteor.userId()
                    }
                });
            }
            else {
                Meetups.insert({
                    region: params.region,
                    city: params.location,
                    meetupId: params.meetupId,
                    url: params.meetupUrl,
                    userId: Meteor.userId()
                });
            }
        }
    },
    fetchRSVPs: function() {

        var meetups = Meetups.find().fetch();
        var count = Meetups.find().count();
        var x = 0;
        
        console.log( "Initiating Meetup Events Processing..");
        function f() {
            var meetup = meetups[x];

            Meteor.call('MeetupAPI', 'getRSVPs', { "event_id": meetup.meetupId, "fields" : "host"}, function(err, response) {
                if (!err) {

                    var attendees = [];
                    var attendeesCount = 0;
                    var totalGuestsCount = 0;
                    var addattendeeToMeetup = false;
                    var hosts = [];
                    for (var i = 0, l = response.meta.count; i < l; i++) {
                        var node = response.results[i];
                        var attendee = {};
                        if(node.hasOwnProperty("guests")) {
                            totalGuestsCount = totalGuestsCount + node.guests;
                        }
                        //console.log("meetup: " + meetup.groupName, "member: ", node.name);
                        attendee.memberName = node.member.name;
                        attendee.memberId = node.member.member_id;
                        attendee.profile_url = "http://www.meetup.com/" + meetup.groupName + "/members/" + attendee.memberId;   //unfortunately getRSVPs does not return profile url;
                        if (node.hasOwnProperty("member_photo") && node.member_photo.photo_link != "") {
                            
                            attendee.thumbnailUrl = node.member_photo.photo_link;
                            addattendeeToMeetup = true;
                        
                        }
                        else {
                            //console.log("Skipping due to missing photo - ", attendee.memberName);
                            addattendeeToMeetup = false;
                        }
                        //exclude folks who rsvpd no.
                        if ( node.response === "no") {
                            addattendeeToMeetup = false;
                        } else {
                            attendeesCount++;
                        }
                        
                        if(addattendeeToMeetup) {
                            //console.log("Adding attendee - ", attendee.memberName);
                            attendees.push(attendee);
                        }
                    }
                    //console.log("Updating attendees for: ", meetup.groupName);
                    
                    // Lets find the leadership team for this group
                    
                    Meteor.call("MeetupAPI" , "getLeaders" , {"group_urlname": meetup.groupName, "role":"leads"} , function (err , response) {
                        if (!err) {
                            var leaders = response.results;
                            for ( i = 0 ; i < response.meta.count ; i++ ) {
                                
                                var hostId = leaders[i].member_id;
                                //Only consider those leaders who have RSVPd.
                                if ( _.findWhere( attendees , {'memberId' : hostId}) ) {
                                    leader = {};
                                    if(leaders[i].hasOwnProperty("photo") && leaders[i].photo.photo_link !== "") {
                    					leader.thumbnailUrl = leaders[i].photo.photo_link;
                    				} 
                                    leader.memberId = leaders[i].member_id;
                                    leader.memberName = leaders[i].name;
                                    leader.profile_url = leaders[i].profile_url;
                                    leader.role= leaders[i].role;
                                    leader.host = true;
                                    hosts.push(leader);
                                }
                            }
                            Meetups.update({
                                _id: meetup._id
                            }, {
                                $set: {
                                    attendees: attendees,
                                    attendeesCount: attendeesCount,
                                    attendeesWithPhotosCount: attendees.length,
                                    totalGuestsCount: totalGuestsCount,
                                    hosts: hosts
                                }
                            });
                            
                        }
                    });
                }
                else {
                    //console.log("Error running getRSVPs meetup api: ", err.code, err.details);
                    x = count;
                }

            });
            x++;
            if (x < count) {
                Meteor.setTimeout(f, 3000);
            } else {
                console.log(" Finished processing Meetup Events");
            }
        }
        f();
    }
});

//Cron job

var fetchAttendees = new Cron(function() {
  Meteor.call("fetchRSVPs") ;
} , {
  minute: 30
});


// Publications
Meteor.publish("meetups", function() {
    return Meetups.find({}, {
        fields: {
            attendees: {
                $slice: 4
            }
        }
    });
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
