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
    // google place search global because needed for google's getDetails method
    app.service;
    var infowindow;
    app.inspectionsArray = [];
    app.RestaurantArray= [];
    // used to track highlight for reset on next click
    app.currentHighlight = null;

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
        infowindow = new google.maps.InfoWindow();
        app.service = new google.maps.places.PlacesService(app.map);
        app.service.nearbySearch({
            location: app.neighborhood,
            radius: 500,
            type: ['restaurant']
        }, callback);
    }
    function callback(results, status) {
        if (status=== google.maps.places.PlacesServiceStatus.OK) {
            app.RestaurantArray = results.map(function (item) {
                return new Restaurant(item);
            });
            app.RestaurantArray.forEach(createMarker);
            ko.applyBindings(new RestaurantsViewModel(app.RestaurantArray), document.getElementById('mapView'));
        } else {
            console.log("place service status error");
        }
    }  // end callback

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
            animation: google.maps.Animation.DROP,
            position: place.geometry().location,
            id: place.id,
            content: place.name() + '<br>' + 'Rating: ' + place.rating() + '<br>' + 'Price Level (0 - 4): ' + place.priceLevel()
        });

        google.maps.event.addListener(place.mapMarker, 'click', function () {
            console.log('mapMarker clicked');
            place.octoHighlighter();
        })

    } // end create marker



    // Restaurant Model
    // ----------
    // Our basic restaurant based on google place response object
    //  see https://developers.google.com/maps/documentation/javascript/places#place_search_responses
    var Restaurant;
    Restaurant = function (restaurantObj) {
        this.mapIconNormal = 'img/restaurant.png';
        this.mapIconRed = 'img/restaurant.red.png';
        this.geometry = ko.observable(restaurantObj.geometry);
        this.id = ko.observable(restaurantObj.id);
        this.name = ko.observable(restaurantObj.name);
        this.placeId = ko.observable(restaurantObj.place_id);
        this.priceLevel = ko.observable(restaurantObj.price_level);
        this.rating = ko.observable(restaurantObj.rating);
        this.vicinity = ko.observable(restaurantObj.vicinity);
        this.mapIcon = ko.observable(this.mapIconNormal);
        this.mapMarker = ko.observable();
        this.getName = function () {
            return this.name;
        };

        // function called when either list of marker clicked
        this.octoHighlighter = function () {
            if (app.currentHighlight !== null) {
                app.currentHighlight.setIcon(this.mapIconNormal);
            }
            this.mapMarker.setIcon(this.mapIconRed);

            // request google place details based on google placeI
            // placeId was part of google placeSearch results
            var request = {
                placeId : this.placeId
            };
            app.service.getDetails(request, callback);
            function callback(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    console.log('google details received');
                    console.log(place);
                }
            }

            // see this post re adding dynamic content using single infoWindow
            // http://stackoverflow.com/questions/9475830/google-maps-api-v3-markers-all-share-the-same-infowindow?rq=1
            infowindow.setContent(this.mapMarker.content);
            infowindow.open(app.map, this.mapMarker);
            app.currentHighlight = this.mapMarker;

            // search other api data

        }
    };

    function RestaurantsViewModel(mappedArray) {
        var self = this;
        self.restaurants = ko.observableArray(mappedArray);
        self.getRestaurants = function () {
            return self.restaurants;
        };

    }



    // NYC Restaurant inspection api request
    function searchNYCinspections(name, building, street, boro) {
        $.ajax({
            url: "https://data.cityofnewyork.us/resource/9w7m-hzhe.json",
            type: "GET",
            data: {
                "zipcode" : '11372',
                "$limit" : 500,
                "$$app_token" : "PCvLGVSSaI1KBWr0dwX7vhl1E",
                "$q": search,
                "$select": "*"
            }
        }).done(function(data) {
            console.log(data);
            // data is an array of objections returned from api
        });
    }



    // yelp oAuth request
    // var yelpAuth = $.ajax({
    //         url: "https://api.yelp.com/oauth2/token",
    //         type: "POST",
    //         data: {
    //             "format" : "json",
    //             "grant_type" : "client_credentials",
    //             "client_id" : 'Nsxn2KaNaFNlZQkHoRj4XA',
    //             "client_secret" : 'YaEwjUrVIT7UmS6eboSEE1XiNtv29uRZjloeBmnUC9bedaQKi0uPCvUintSLpFp4'
    //         },
    //     dataType : "jsonp"
    //     }).done(function(data) {
    //         console.log("yelp success");
    //         console.log(data);
    //     });

})();