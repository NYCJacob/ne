/**
 * Created by jsherman on 1/16/17.
 */
/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    app.callback = function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            app.resultsArray = results;
            for (var i = 0; i < app.resultsArray.length; i++) {
                // console.log(results[i]);
                createMarker(app.resultsArray[i]);
                RestaurantsViewModel();
            }
        }
    };

    function createMarker(place) {
        // set icon for marker
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        var marker = new google.maps.Marker({
            map: app.map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id
        });

        // google.maps.event.addListener(marker, 'click', function() {
        //     infowindow.setContent(place.name);
        //     infowindow.open(map, this);
        // });
    }


    // Restaurant Model
    // ----------

    // Our basic restaurant based on google place response object
    //  see https://developers.google.com/maps/documentation/javascript/places#place_search_responses
    // represent a single restaurant item
    var Restaurant = function (restaurantObj) {
        this.geometry = ko.observable(restaurantObj.geometry);
        this.id =ko.observable(restaurantObj.id);
        this.name =ko.observable(restaurantObj.name);
        this.placeId =ko.observable(restaurantObj.placeId);
    };
            // geometry : {},
            // icon : "",
            // id : "",
            // name : "",
            // opening_hours : {},
            // photos : [],
            // place_id : "",
            // price_level : null,
            // rating : null,
            // types : []

    // our main view model
    function RestaurantsViewModel() {
        var self = this;

        self.SERVICE    = new google.maps.places.PlacesService(self.MAP);

        var request = {
            location     : center_marker.getPosition(),
            keyword      : search_terms,
            name         : name_terms,
            minPriceLevel: price_level,
            types        : store_types,
            rankBy       : google.maps.places.RankBy.DISTANCE
        };

        self.SERVICE.nearbySearch(request, function(results, status) {
            // Do stuff when I get the results returned to me
        }


    };

    // var viewModel = new ViewModel(app.resultsArray || []);
    ko.applyBindings(RestaurantsViewModel);

})();