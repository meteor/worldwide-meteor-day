//Subscribe to meetups;

Meteor.subscribe("meetups");

Template.meetups.helpers({
    'selectRegions' : function(regions) {
        return _.map(regions.split(","), function(region){return region.trim()});
    },
    'meetups' : function(region) {
        return Meetups.find({region:region}, {sort: {city: 1}});
    },
    'remaining' : function(meetup) {
        if (meetup.attendeesWithPhotosCount > 5 ) {
            return meetup.attendeesCount + meetup.totalGuestsCount - 5 ;
        } else {
            return (meetup.attendeesCount - meetup.attendeesWithPhotosCount) + meetup.totalGuestsCount;
        }
    }
})

