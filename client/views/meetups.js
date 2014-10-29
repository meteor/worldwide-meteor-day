//Subscribe to meetups;

Meteor.subscribe("meetups");

// Template.meetups.regions = function() {
//     //hardcoding since it is not sorted, and mongodb query may result in any order ( if not sorted )
//     return ["North America", "Europe", "Africa", "Australia", "Asia", "South America"];
// }

Template.meetups.rendered = function() {
//   window.setTimeout(function() {
//     $('[data-toggle=tooltip]').tooltip();
//   }, 800);
}

Template.meetups.selectRegions = function(regions) {
    return _.map(regions.split(","), function(region){return region.trim()});
}

Template.meetups.meetups = function(region) {
    console.log("Region: ", region);
    return Meetups.find({region:region}, {sort: {city: 1}});
}

Template.meetups.remaining = function(meetup) {
    if (meetup.attendeesWithPhotosCount > 5 ) {
        return meetup.attendeesCount + meetup.totalGuestsCount - 5 ;
    } else {
        return (meetup.attendeesCount - meetup.attendeesWithPhotosCount) + meetup.totalGuestsCount;
    }
}
