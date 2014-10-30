Meteor.startup(function () {
  $('body').attr({
    "id": "page-top",
    "data-spy": "scroll",
    "data-target": ".navbar-fixed-top"
  });

  Session.set('citiesCount', $('#attend a').length-3);
});

Template.body.helpers({
  citiesCount: function () {
      return Session.get('citiesCount');
  }
});
