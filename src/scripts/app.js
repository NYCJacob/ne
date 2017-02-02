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



        // single infoWindow instance
        app.infoWindow = new google.maps.InfoWindow();
        // app.infoWindow.setContent(infoContent);

        // first get standard place data - need place_id for details search
        //TODO: need onerror handler
        getPlacesData();
    };  // end app.init

    // based on google map place search api example
    // https://developers.google.com/maps/documentation/javascript/examples/place-search
    function getPlacesData(){
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
                // passing index for map marker/list numbering
                var itemIndex = results.indexOf(item);
                return new Restaurant(item, itemIndex);
            });
            app.RestaurantArray.forEach(createMarker);
            ko.applyBindings(new RestaurantsViewModel(app.RestaurantArray), document.getElementById('mapView'));
            app.RestaurantArray.forEach(googleDetails);

        } else {
            console.log("place service status error");
        }
    }  // end callback

    function googleDetails(restaurant) {
        var serviceDetails =  new google.maps.places.PlacesService(app.map);
        var request = { placeId: restaurant.placeId };
        serviceDetails.getDetails(request, callback);
        function callback(details, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log('Details received ' + details);
                // need to send details to the restaurant object
                restaurant.addDetails(details);
            }else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                setTimeout(function() {
                    googleDetails(restaurant);
                }, 200);}
            else {
                console.log("details error " + status);
            }
        }
    } // end googleDetails


    function createMarker(place) {
        // set icon for marker
        var image = {
            url: place.mapIcon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        // Create a marker for each place.
        place.mapMarker = new google.maps.Marker({
            map: app.map,
            icon: image,
            title: place.name,
            animation: google.maps.Animation.DROP,
            position: place.geometry.location,
            id: place.id
            // content: place.name + 'Rating: ' + place.rating + '<br>' + 'Price Level (0 - 4): ' + place.priceLevel
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
    Restaurant = function (restaurantObj, index) {
        //todo decide whether to use index numbering in map- hard to place number in restaurant icon
        this.index = index + 1;   // 1 added for UI numbering ;
        this.mapIconNormal = 'img/mapMakerIcons/3b8dc8/restaurant.png';
        this.mapIconRed = 'img/mapMakerIcons/ff0000/restaurant.png';
        // details search geometry object includes
        // location object and viewport object
        this.geometry = restaurantObj.geometry;
        this.address_formatted = restaurantObj.formatted_address;
        this.address_components = restaurantObj.address_components;
        this.phone = restaurantObj.formatted_phone_number;
        this.hours = restaurantObj.opening_hours;
        this.photos = restaurantObj.photos;
        this.reviews = restaurantObj.reviews;
        this.website = '';
        this.id = restaurantObj.id;
        this.name = restaurantObj.name;
        this.placeId = restaurantObj.place_id;
        this.priceLevel = restaurantObj.price_level;
        this.rating = restaurantObj.rating;
        this.vicinity = restaurantObj.vicinity;
        this.mapIcon = this.mapIconNormal;
        this.mapMarker = '';
        this.getName = function () {
            return this.name;
        };

        // method to process details data into object
        this.addDetails = function(details){
            this.address_components = details.address_components;
            this.address_formatted = details.formatted_address;
            this.phone = details.formatted_phone_number;
            this.geometry = details.geometry;
            this.hours = details.opening_hours;
            this.rating = details.rating;
            this.photos = details.photos;
            this.reviews = details.reviews;
            this.website = details.website;
        };

        this.addInspections = function (inspectionData) {
            console.log(inspectionData);
        };

        // method called when either list or marker clicked
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
            function callback(placeDetails, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    console.log('google details received');
                    // console.log(placeDetails);
                    // TODO: sometimes getting typeError 'Cannot read property 'addDetails' of null
                    this.addDetails(placeDetails);
                    // search NYC inspection api based on name and address
                    searchNYCinspections(placeDetails.place_id ,placeDetails.name, placeDetails.address_components);
                }
            }
            app.currentHighlight = this.mapMarker;

            app.infoWindow.setContent(makeInfoHTML(this));
            app.infoWindow.open(app.map, this.mapMarker);
        }
    };

    function makeInfoHTML(place) {
        // for some reason cannot use .slice on address_formatted
        var addressString = place.address_formatted;
        // remove USA from address
        var addressDisplay = addressString.slice(0, -5);

        var openNow = function () {
          if (place.hours.open_now === true) {
              return 'YES';
          }  else if (place.hours.open_now === false) {
              return "NO";
          } else
              return 'unknown';
        } ;

        var openHours = function () {
            var HTML = '<ul>';
            for (var i = 0; i < place.hours.weekday_text.length; i++) {
                // console.log(place.hours.weekday_text[i]);
                HTML += '<li>' + place.hours.weekday_text[i] + '</li>';
            }
            HTML += '</ul>';
            return HTML;
        };

        var priceIcon = function () {
            switch (place.priceLevel) {
                case 1:
                    return '$';
                    break;
                case 2:
                    return '$$';
                    break;
                case 3:
                    return '$$$';
                    break;
                case 4:
                    return '$$$$';
                    break;
                case 5:
                    return '$$$$$';
                    break;
                default:
                    return 'unknown';
            }
        };

        var reviewsHTML = function () {
            var HTML = '<ul>';
            for (var x = 0; x < place.reviews.length; x++) {
                HTML += '<li>' + place.reviews[x].author_name   + '</li>';
            }

            HTML += '</ul>';
            return HTML;
        };

        var infoContent =
            '<div class="infoWindow">' +
                '<span class="infoWindow-name">' + place.name  + '</span>' +
                '<span class="infoWindow-address">' + addressDisplay  + '</span>' +
                '<span class="infoWindow-website">Website ' + place.website  + '</span>' +
                '<span class="infoWindow-priceLevel">Price Level: ' + '</span>' + '<span class="dollar-sign"><strong>' + priceIcon() + '</strong></span>'   + ' | ' +
                '<span class="infoWindow-rating">Google Rating: ' + '</span>' + '<span><strong>' + place.rating + '</strong></span>'+
                '<span class="infoWindow-openNow">' + 'Open Now: ' + openNow()  + '</span>' +
                '<span class="infoWindow-hours">' + '<strong>' + 'Hours: ' + '</strong>' + '</span>' +
                '<span class="infoWindow-open">' + openHours() + '</span>' +
                '<span class="infoWindow-reviewsHead" data-bind="click: toggleReviews">' + 'There are ' + place.reviews.length + ' reviews-click to show/hide.' + '</span>' +
                '<span class="infoWindow-reviews" data-bind="visible: showReviews">' + reviewsHTML() + '</span>';

        return infoContent;
    }

    function RestaurantsViewModel(mappedArray) {
        var self = this;
        self.restaurants = ko.observableArray(mappedArray);
        self.getRestaurants = function () {
            return self.restaurants;
        };

    }

    // NYC Restaurant inspection api request
    /*
    * address_components is an array of objects from google places details that can vary
    * [0]
    *      long_name = string
    *      short_name = string
    *      types = array[0] string of type name ie "street_number"
    *
    * [1] types[0] = route  (ie street name)
    *
    * [2] types[0] neighborhood  [1]  political   ie "Jackson Heights"
    *  ....
    *  [7] types[0] = postal_code
    * */
    function searchNYCinspections(placeId, name, address) {
        // name needs to be all caps
        var nycName = name.toUpperCase();
        // address must be stripped of dashes
        var nycStreetAddress = address[0].long_name;
        //  street may be called route and should be all caps?

        $.ajax({
            url: "https://data.cityofnewyork.us/resource/9w7m-hzhe.json",
            type: "GET",
            data: {
                "zipcode": "11372",
                "dba": nycName,
                "$limit": 50,
                "$$app_token": "PCvLGVSSaI1KBWr0dwX7vhl1E",
                "$select": "*"
            }
        }).done(function (data) {
            //  this is the ajax request object
            console.log(data);
            // data is an array of objections returned from api
            // if request OK but no data
            if (data.length === 0) {

            }
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