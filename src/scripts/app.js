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
            }
            createViewModel(app.resultsArray)
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
    var RestaurantsViewModel = function (resultsArray) {
        var self = this;
        // map array of passed in restaurants to an observableArray of restaurant objects
        self.restaurants = ko.observableArray(resultsArray.map(function (restaurant) {
            return new Restaurant(restaurant);
        }));
    };

    // bind a new instance of our view model to the page when callback calls
    var viewModel;
    function createViewModel(resultsArray) {
        viewModel = new RestaurantsViewModel(resultsArray);
        console.log("createViewModel executed");
    }
    // var viewModel = new ViewModel(app.resultsArray || []);
    ko.applyBindings(RestaurantsViewModel);

})();