//Subscribe to meetups;

Meteor.subscribe("meetups");

Template.meetups.rendered = function() {
    Session.set('cityquery',"");
}

Template.meetups.helpers({
    'selectRegions' : function(regions) {
        return _.map(regions.split(","), function(region){return region.trim()});
    },
    'meetups' : function(region) {
        var searchCity = Session.get('cityquery');
        if (searchCity) {
            return Meetups.find({city:{$regex:searchCity, $options:'i'} , region:region}, {sort: {city: 1}});
        } else {
            return Meetups.find({region:region}, {sort: {city: 1}});
        }
    },
    'remaining' : function(meetup) {
        if (meetup.attendeesWithPhotosCount > 4 ) {
            return meetup.attendeesCount + meetup.totalGuestsCount - 4 ;
        } else {
            return (meetup.attendeesCount - meetup.attendeesWithPhotosCount) + meetup.totalGuestsCount;
        }
    },
    'hostsTruncated' : function(meetup) {
        //If more than 2 hosts, return only 1, else return all
        if (meetup.hosts.length > 2 ) {
            return _.first(meetup.hosts , 1);
        } else {
            return meetup.hosts;
        }
        
    },
    'hostsRemaining' : function(meetup) {
        hosts = meetup.hosts;
        if ( hosts.length > 2) {
            return (hosts.length - 1);
        } else {
            return 0;
        }
    },
    'cityTextIsLong' : function(meetup) {
        return ((meetup.city).length > 24 ) ? true : false;
    },
    'photoUrl' : function(imgUrl) {
        if(!imgUrl) {
            return "/img/no_photo.jpeg";
        } else {
            return imgUrl;
        }
    }
    
})
