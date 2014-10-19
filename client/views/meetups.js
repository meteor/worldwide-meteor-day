Template.meetups.regions = function() {
    //hardcoding since it is not sorted, and mongodb query may result in any order ( if not sorted )
    return ["North America", "Europe", "Africa", "Australia", "Asia", "South America"];
}

Template.meetups.meetups = function(region) {
    return Meetups.find({region:region});
}