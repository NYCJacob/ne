/**
 * Created by jsherman on 1/16/17.
 */
var app = app || {};

(function () {
    'use strict';

    app.neighborhood =  {  // Jackson Heights MTA Train station lat ln
        "lat" : 40.7466891,
        "lng" : -73.8908579
    };

    // Our basic
    app.initMap = function() {
        var styles = [
            {
                featureType: 'water',
                stylers: [
                    {color: '#19a0d8'}
                ]
            }, {
                featureType: 'administrative',
                elementType: 'labels.text.stroke',
                stylers: [
                    {color: '#ffffff'},
                    {weight: 6}
                ]
            }, {
                featureType: 'administrative',
                elementType: 'labels.text.fill',
                stylers: [
                    {color: '#e85113'}
                ]
            }, {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [
                    {color: '#efe9e4'},
                    {lightness: -40}
                ]
            }, {
                featureType: 'transit.station',
                stylers: [
                    {weight: 9},
                    {hue: '#e85113'}
                ]
            }, {
                featureType: 'road.highway',
                elementType: 'labels.icon',
                stylers: [
                    {visibility: 'off'}
                ]
            }, {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [
                    {lightness: 100}
                ]
            }, {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [
                    {lightness: -100}
                ]
            }, {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [
                    {visibility: 'on'},
                    {color: '#f0e4d3'}
                ]
            }, {
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [
                    {color: '#efe9e4'},
                    {lightness: -25}
                ]
            }
        ];

        var mapEle = document.getElementById('mapDiv');

        app.map = new google.maps.Map(mapEle, {
            center: app.neighborhood,
            zoom: 16,
            styles: styles,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            }
        });
        getPlacesData();
    };  // end app.init

    // based on google map place search api example
    // https://developers.google.com/maps/documentation/javascript/examples/place-search
    // infowindow = new google.maps.InfoWindow();
    function getPlacesData(){
        var service = new google.maps.places.PlacesService(app.map);
        service.nearbySearch({
            location: app.neighborhood,
            radius: 500,
            type: ['restaurant']
        }, callback);
    };

    function callback(results, status) {
        if (status=== google.maps.places.PlacesServiceStatus.OK) {
            app.RestaurantArray = results.map(function (item) {
                return new Restaurant(item);
            });
            app.RestaurantArray.forEach(createMarker);

            ko.applyBindings(new RestaurantsViewModel(app.RestaurantArray));
            // RestaurantsViewModel(app.RestaurantArray);
        } else {
            console.log("place service status error");
        }
    };  // end callback

    function createMarker(place) {
        // set icon for marker
        var image = {
            url: place.mapIcon(),
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        place.mapMarker = new google.maps.Marker({
            map: app.map,
            icon: image,
            title: place.name(),
            position: place.geometry().location,
            id: place.id
        });

        var infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(place.mapMarker, 'click', function() {
            infowindow.setContent(place.name());
            infowindow.open(app.map, place.mapMarker);
        });

    }

    // Restaurant Model
    // ----------
    // Our basic restaurant based on google place response object
    //  see https://developers.google.com/maps/documentation/javascript/places#place_search_responses
    var Restaurant = function (restaurantObj) {
        this.mapIconNormal = 'img/restaurant.png';
        this.mapIconRed = 'img/restaurant.red.png';
        this.geometry = ko.observable(restaurantObj.geometry);
        this.id =ko.observable(restaurantObj.id);
        this.name =ko.observable(restaurantObj.name);
        this.placeId =ko.observable(restaurantObj.place_id);
        this.priceLevel = ko.observable(restaurantObj.price_level);
        this.rating = ko.observable(restaurantObj.rating);
        this.mapIcon = ko.observable(this.mapIconNormal);
        this.mapMarker = ko.observable();
    };

    function RestaurantsViewModel(mappedArray) {
        var self = this;
        self.restaurants = ko.observableArray(mappedArray);

        self.weather = ko.observableArray([]);

        // viewModel functions
        self.highlightMarker = function (clicked) {
            console.log('highlightMarker clicked' + clicked);
            // self.mapIcon = this.mapIconRed;
            clicked.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
            // marker will keep bouncing until set to null
            // clicked.mapMarker.setAnimation(null);
        };

        // Load weather data from openweather, then populate self.weather
        var openWeatherApi = 'api.openweathermap.org/data/2.5/forecast?id=4891010&APPID=ff58a74b7a0939cd34d96dc917a5a0d6';
        $.getJSON(openWeatherApi, function(weatherData) {
            var mappedTasks = $.map(weatherData, function(item) { return new Task(item) });
            self.tasks(mappedTasks);
        });
    };


})()