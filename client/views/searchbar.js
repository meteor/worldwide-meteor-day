var lastTimeout, timeOut;

Template.searchbar.events({
    'keyup input#city-search-input' : function(e,t) {
        lastTimeout = timeOut;
        var delay = 1000;
        if($("#city-search-input").val() == "")
            delay=0;
        timeOut = Meteor.setTimeout(function(){
            Session.set("cityquery", $("#city-search-input").val());
        },delay);
        Meteor.clearTimeout(lastTimeout);
    }
})