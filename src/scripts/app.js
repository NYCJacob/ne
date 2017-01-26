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
    }
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
            position: place.geometry().location,
            id: place.id
        });

        function createWindowNode(place){
            var windowDiv= $("<div/>", {
                html: '<h1>' + place.name() + '</h1>'
            });
            $("<div/>", {
                html: 'Rating: ' + place.rating()
            }).appendTo(windowDiv);

        }

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(place.mapMarker, 'click', function() {
            // infowindow.setContent(place.name() + place.rating());
            infowindow.setContent(
                '<div><h3>' + place.name() + '</h3>' + '<br>' +
                'Rating: ' + place.rating() + '</div>' + '<br>' +
                    'Price Level (0 - 4): ' + place.priceLevel()
            );
            infowindow.open(app.map, place.mapMarker);
        });


    }

    //TODO need to make a function from click on infowindow
    // NYC Restaurant inspection api request
    var search = 'Dosa';
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
        alert("Retrieved " + data.length + " records from the dataset!");
        console.log(data);
    });

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
        this.infoWin = '';
        this.toggleIcon = function () {
            console.log('---toggleIcon method hit---');
            if (this.mapIcon === 'img/restaurant.png') {
                this.mapIcon = this.mapIconRed;
            } else {
                this.mapIcon = this.mapIconNormal;
            }
        }
    };

    function RestaurantsViewModel(mappedArray) {
        var self = this;
        self.restaurants = ko.observableArray(mappedArray);
        // method to find restaurant object by place id
        self.getRestaurantIndex = function (placeId) {
            for (var x = 0; x < restaurants.length(); x++) {
                if (restaurants[x].placeId = placeId) {
                    return x;
                }
            }
            return -1;
        };

        self.weather = ko.observableArray([]);

        // viewModel functions
        // track highlighted marker for easy highlight removal
        var currentHighlight;
        var priorHighlight;
        var clickIndex;
        self.highlightMarker = function (clicked) {
            console.log('highlightMarker clicked' + clicked);
            // clear prior highlighted icon if any
            if (priorHighlight !== undefined) {
                priorHighlight.mapMarker.icon = this.mapIconNormal;
            }

            // currentHighlight = getRestaurantIndex(clicked.id());
            clicked.mapMarker.icon = this.mapIconRed;
            // clicked.toggleIcon();
            clicked.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
            // marker will keep bouncing until set to null
            // each bounce is approx 700ms ???
            setTimeout(function(){ clicked.mapMarker.setAnimation(null); }, 2100);

            priorHighlight = clicked;
        };


        // Load weather data from openweather, then populate self.weather
        // var openWeatherApi = 'api.openweathermap.org/data/2.5/forecast?id=4891010&APPID=ff58a74b7a0939cd34d96dc917a5a0d6&units=imperial';
        // $.getJSON(openWeatherApi, function(weatherData) {
            // var mappedTasks = $.map(weatherData, function(item) { return new Task(item) });
            // self.tasks(mappedTasks);
        // });
    }

})();