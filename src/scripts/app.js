/**
 * Created by jsherman on 1/16/17.
 */
var app = app || {};

(function () {
    'use strict';

    // global var for off canvas navigation functions
    app.detailsSidebar = document.getElementById("details-sidebar");
    app.mapDivEl = document.getElementById("mapDiv");
    app.listingEl = document.getElementById("listings");
    app.leftHamburger = document.getElementById("leftHamburger");
    app.headerEl = document.getElementById("weather");

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

/*
*   initMap is a callback in the google map api call in index.html that starts the map
*/
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
            zoom: 15,
            styles: styles,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            }
        });

        // single infoWindow instance
        app.infoWindow = new google.maps.InfoWindow();

        // first get standard place data - need place_id for details search
        getPlacesData();
    };  // end app.init

    // based on google map place search api example
    // https://developers.google.com/maps/documentation/javascript/examples/place-search
    /*getPlacesData is called from the initMap function
    * it executed a google places nearbySearch that obtains the
    * restaurant array data via the callback function
    * */
    function getPlacesData(){
        app.service = new google.maps.places.PlacesService(app.map);
        app.service.nearbySearch({
            location: app.neighborhood,
            radius: 500,
            type: ['restaurant']
        }, callback);
    }

    /*callback function is called from getPlacesData
    * it executes a google places search
    */
    function callback(results, status) {
        if (status=== google.maps.places.PlacesServiceStatus.OK) {
            app.RestaurantArray = results.map(function (item) {
                // passing index for map marker/list numbering
                var itemIndex = results.indexOf(item);
                return new Restaurant(item, itemIndex);
            });
            app.RestaurantArray.forEach(createMarker);
            app.RestaurantArray.forEach(googleDetails);
            // make vm app globle so selector function works
            app.vm = new RestaurantsViewModel(app.RestaurantArray);
            // apply ko bindings to main-content b/c weather bound to header
            ko.applyBindings(app.vm, document.getElementById('main-content'));
        } else {
            console.log("place service status error");
        }
    }  // end callback
    /*
    *  googleDetails executes a google details search to get information not returned
    *  by nearbySearch
    */
    function googleDetails(restaurant) {
        var serviceDetails =  new google.maps.places.PlacesService(app.map);
        var request = { placeId: restaurant.placeId };
        serviceDetails.getDetails(request, callback);
        function callback(details, status){
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                // console.log('Details received ' + details);
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
            app.vm.octoHighlighter(place);
        })

    } // end create marker



    // Restaurant Model
    // ----------
    // Our basic restaurant based on google place response object
    //  see https://developers.google.com/maps/documentation/javascript/places#place_search_responses
    var Restaurant;
    Restaurant = function (restaurantObj, index) {
        // self added to access object from ajax callback
        var self = this;
        //todo decide whether to use index numbering in map- hard to place number in restaurant icon
        this.index = index + 1;   // 1 added for UI numbering ;
        self.selected = false;
        this.mapIconNormal = 'img/mapMakerIcons/3b8dc8/restaurant.png';
        this.mapIconRed = 'img/mapMakerIcons/ff0000/restaurant.png';
        // details search geometry object includes
        // location object and viewport object
        this.geometry = restaurantObj.geometry;
        this.getLatLn = function () {
            var latln = this.geometry.location;
          return latln;
        };
        this.address_formatted = '';
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

        this.inspectionResults = ko.observableArray();
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
        this.yelpResults = ko.observableArray();
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

        var infoContent =
            '<div class="infoWindow">' +
                '<span class="infoWindow-name">' + place.name  + '</span>' +
                '<span class="infoWindow-address">' + addressDisplay  + '</span>' +
                '<span class="infoWindow-website">Website ' + place.website  + '</span>' +
                '<span class="infoWindow-priceLevel">Price Level: ' + '</span>' + '<span class="dollar-sign"><strong>' + priceIcon() + '</strong></span>'   + ' | ' +
                '<span class="infoWindow-rating">Google Rating: ' + '</span>' + '<span><strong>' + place.rating + '</strong></span>'+
                '<span class="infoWindow-openNow">' + 'Open Now: ' + openNow()  + '</span>' +
                '<span class="infoWindow-hours">' + '<strong>' + 'Hours: ' + '</strong>' + '</span>' +
                '<span class="infoWindow-open">' + openHours() + '</span>';
        return infoContent;
    }

    function RestaurantsViewModel(mappedArray) {
        var self = this;

        // check if google maps responded
        setTimeout(function () {
            if (typeof google !== 'object'){
                self.noInternet(true);
            }
        }, 3000);

        self.noInternet = ko.observable(false);
        self.restaurants = ko.observableArray(mappedArray);
        // used to tell viewModel what to display
        self.currentPlace = ko.observable(null);
        self.showSlides = ko.observable(false);
        self.noPhotos = ko.observable(false);
        self.showPhotos = ko.observable(false);
        self.togglePhotos = function () {
            if ( self.showPhotos() === false ) {
                self.showPhotos(true);
            } else {
                self.showPhotos(false);
            }
        };

        // array of google place photos
        self.placePhotos = ko.observableArray([]);
        // make photo url object
        self.photoUrlArray = function () {
            if (self.placePhotos() !== undefined) {
                var urlArray = [];
                ko.utils.arrayForEach(self.placePhotos(), function (photo) {
                    urlArray.push(photo.getUrl({'maxHeight': 50, 'maxWidth': 50}))
                });
                return urlArray;
            } else {
                self.noPhotos(true);
                self.showPhotos(false);
                return [];
            }
        };

        self.slideUrlArray = function () {
            if (self.noPhotos() === false) {
                var slidesArray = [];
                // calculate width of photos parent div
                var detailsSidebarWidth =  $('#details-sidebar').innerWidth();
                var detailsSidebarHeight =  $('#details-sidebar').innerHeight();
                ko.utils.arrayForEach(self.placePhotos(), function (photo) {   //url object must be integer
                    slidesArray.push(photo.getUrl({'maxHeight': Math.floor(detailsSidebarWidth * .75), 'maxWidth': Math.floor(detailsSidebarHeight * .25)}));
                });
                return slidesArray;
            } else {
                return -1;
            }

        };

        // slide show code from http://www.w3schools.com/w3css/w3css_slideshow.asp
        self.slideIndex = 1;
        self.slideShow = function (n) {
            var i;
            var x = document.getElementsByClassName("mySlides");
            if (n > x.length) {self.slideIndex = 1}
            if (n < 1) {self.slideIndex = x.length}
            for (i = 0; i < x.length; i++) {
                x[i].style.display = "none";
            }
            x[self.slideIndex-1].style.display = "block";
        };
        self.nextSlide = function (n) {
            self.slideShow(self.slideIndex+=n);
        };

        // headline for review in sidebar- when clicked show reviews
        self.reviewHeadline = ko.observable();
        self.showReviews = ko.observable(false);
        self.inspectionHeadline = ko.observable();
        self.photosHeadline = ko.observable();
        self.showInspections = ko.observable(false);
        // toggle visibility of addition info html if ajax success
        self.inspectionRequestSuccess = ko.observable(false);
        self.showYelp = ko.observable(false);
        self.yelpHeadline = ko.observable();
        self.yelpRequestSuccess = ko.observable(false);
        self.searchTerm = ko.observable("");

        //filter the items using the filter text
        // based on http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
        self.filteredItems = ko.computed(function() {
            var filter = self.searchTerm().toLowerCase();
            if (!filter) {
                self.restaurants().forEach(function(place){
                    place.mapMarker.setVisible(true);
                });
                return self.restaurants();
            } else {
                return ko.utils.arrayFilter(self.restaurants(), function(item) {
                    // return ko.utils.stringStartsWith(item.name.toLowerCase(), filter);
                    var match = item.name.toLowerCase().indexOf(filter) !== -1;
                    item.mapMarker.setVisible(match);
                    return match;
                });
            }
        });

        // method called when either list or marker clicked
        self.octoHighlighter = function (clickedPlace) {
            // reset photo toggles to clear prior click events
            self.showPhotos(false);
            self.noPhotos(false);
            if (self.currentPlace() !== null) {
                self.currentPlace().mapMarker.setIcon(self.currentPlace().mapIconNormal);
                // clear details sidebarhtml
                self.reviewHeadline('');
            }
            clickedPlace.mapMarker.setIcon(clickedPlace.mapIconRed);
            app.infoWindow.setContent(makeInfoHTML(clickedPlace));
            app.infoWindow.open(app.map, clickedPlace.mapMarker);
            // make clicked place the current place
            self.currentPlace(clickedPlace);
            // array of google place photos to placePhotos ko observableArray
            self.placePhotos(clickedPlace.photos);
            self.reviewTotal = function () {    // avoids undefined error if no reviews
                var reviewAmt;
                if (self.currentPlace().reviews === undefined || self.currentPlace().reviews === 0) {
                    reviewAmt = 0;
                } else {
                    reviewAmt = self.currentPlace().reviews.length;
                }
                return reviewAmt;
            };
            self.reviewHeadline( self.currentPlace().name + ' has ' + self.reviewTotal() + ' reviews from Google.');
            // api calls
            self.getNYCinspections(self.currentPlace);
            if (self.currentPlace().phone !== undefined) {
                self.getYelp(self.currentPlace);
            } else {
                self.yelpHeadline(self.currentPlace().name   + ' has insufficient data to perform Yelp search.');
            }

            self.showDetailsSidebar();
            // app.map.setCenter(self.currentPlace().getLatLn());
            app.map.panTo(app.neighborhood);
        };

        self.closeNav = function () {
            app.detailsSidebar.style.width = "0";
            app.detailsSidebar.style.visibility = "hidden";
            app.mapDivEl.style.width = "100%";
            app.listingEl.style.marginLeft = '0';
            app.leftHamburger.style.transform = 'translate(-25vw, 0)';
            app.leftHamburger.style.transition = 'transform 0.3s ease';
            app.leftHamburger.style.display = 'none';
            app.infoWindow.close();
            app.map.panTo(app.neighborhood);
        };

        self.showDetailsSidebar = function () {
            app.detailsSidebar.style.width = "50%";
            app.detailsSidebar.style.visibility = "visible";
            // app.mapViewEl.style.marginRight = "250px";
            app.mapDivEl.style.width = "50%";
            app.listingEl.style.marginLeft = '-50%';
            // show left hamburger icon for listingEl
            app.leftHamburger.style.transform = 'translate(0, 0)';
        };

        self.toggleSlides = function () {
            if ( self.showSlides() === false ) {
                self.showSlides(true);
                self.slideShow(1);
            } else {
                self.showSlides(false);
            }
        };

        self.toggleReviews = function () {
            if ( self.showReviews() === false ) {
                self.showReviews(true);
            } else {
                self.showReviews(false);
            }
        };

        self.toggleInspections = function () {
            if ( self.showInspections() === false ) {
                self.showInspections(true);
                if (self.showReviews() === true) {
                    self.showReviews(false);
                }
            } else {
                self.showInspections(false);
            }
        };

        self.toggleYelp = function () {
            if ( self.showYelp() == false ) {
                self.showYelp(true);
            } else {
                self.showYelp(false);
            }
        };

        self.getNYCinspections = function (currentPlace) {
            var nycPlaceName = currentPlace().name.toUpperCase();
            $.ajax({
                url: "https://data.cityofnewyork.us/resource/9w7m-hzhe.json",
                type: "GET",
                data: {
                    "zipcode": "11372",
                    "dba": nycPlaceName,
                    "$limit": 50,
                    "$$app_token": "PCvLGVSSaI1KBWr0dwX7vhl1E",
                    "$select": "*"
                }
            }).done(function (data) {
                // data is an array of objections returned from api
                console.log('nyc ajax done: ' + data);
                // check if there are results returned (sometimes ajax success returns no data)
                // this technique from SO http://stackoverflow.com/questions/23851337/check-if-ajax-response-data-is-empty-blank-null-undefined-0#23855590
                if (!$.trim(data)) {
                    self.inspectionRequestSuccess = false;
                    self.inspectionHeadline('No NYC inspection data found.');
                }
                // todo a better api call might avoid this processing
                // array of graded inspection from all inspections because not all have grade
                // although all inspections have a score which could be used in future version
                var gradedInspections = [];
                self.inspectionRequestSuccess = true;
                data.forEach(function (inspection) {
                    if (inspection.hasOwnProperty('grade')) {
                        // convert to date object for sorting/ easier display options
                        inspection.grade_date = new Date(inspection.grade_date);
                        // short date for ui display
                        inspection.grade_date_display = inspection.grade_date.getMonth() + '-' + inspection.grade_date.getDate() + '-' +
                                inspection.grade_date.getFullYear();
                        gradedInspections.push(inspection);
                    }
                });
                // sort inspections by date most recent first
                gradedInspections.sort(function(a,b){return b.grade_date - a.grade_date});
                self.currentPlace().inspectionResults(gradedInspections);
                self.latestGrade = function () {
                    if ( gradedInspections === undefined || gradedInspections.length === 0) {
                        return 'unknown';
                    } else {
                        return  gradedInspections[0].grade;
                    }
                };
                self.inspectionHeadline('Latest Grade: ' + self.latestGrade());
            }).fail(function() {
                console.log( "nycinspection ajax error" );
                self.inspectionRequestSuccess = false;
                self.inspectionHeadline('Request failed, please try again later.');
            });
        };

        self.getYelp = function (currentPlace) {
            // oAuth token  yelp api2.0 uses oAuth 1.0  NOT FUSION which uses oauth2
            /**
             * Generates a random number and returns it as a string for OAuthentication
             * @return {string}
             *
             */
            function nonce_generate() {
                return (Math.floor(Math.random() * 1e12).toString());
            }

            function cleanPhone(phone) {
                return phone.replace(/\D/g,'');
            }

            var phone = function () {
                if (currentPlace().phone !== undefined) {
                    return cleanPhone(currentPlace().phone);
                } else {
                    return -1;
                }
            };

            var  consumerSecret = 'gtnzS8XUXupQ7t3yEUM-zgJeNz8';
            var  consumer_key  = '5e8aVm47PCOnFIqWNsAO3A';
            var token  =  'e9CjCBMdlA3nunOhtdN9xHkNyc_Qa329';
            var tokenSecret  = 'z9vc2A_2yoIUYqe34Z3hKZlddYI';
            var httpMethod = 'GET';
            var yelpUrl = 'https://api.yelp.com/v2/phone_search?phone=' + phone();

            var yelpParams = {
                phone: phone(),
                oauth_consumer_key: consumer_key,
                oauth_token: token,
                oauth_nonce: nonce_generate(),
                oauth_timestamp: Math.floor(Date.now()/1000),
                oauth_signature_method: 'HMAC-SHA1',
                oauth_version : '1.0',
                callback: 'cb'
            };

            var encodedSignature = oauthSignature.generate(httpMethod, yelpUrl, yelpParams, consumerSecret, tokenSecret);
            yelpParams.oauth_signature = encodedSignature;

            var settings = {
                url: yelpUrl,
                data: yelpParams,
                cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
                dataType: 'jsonp',
                success: function(results) {
                    // console.log("SUCCCESS! %o", results);
                    self.yelpRequestSuccess(true);
                    var cleanYelpResults;
                    if (results.businesses.length > 1) {  // more than one business in results
                        results.businesses.forEach(function (business) {
                            if (business.name === currentPlace().name) {
                                cleanYelpResults = business;
                            }
                        });
                        self.currentPlace().yelpResults(cleanYelpResults);  // business with exact name
                    } else {  // assuming there is only one obj in array or no exact match use first
                        self.currentPlace().yelpResults(results.businesses[0]);
                    }
                    self.yelpHeadline("Yelp has " +  self.currentPlace().yelpResults().review_count + " reviews.");
                },
                error: function(error) {
                    // Do stuff on fail
                    console.log('yelp error' , error);
                    self.yelpRequestSuccess(false);
                    self.yelpHeadline("There was an error, please try again later.")
                }
            };
            // Send AJAX query passing settings object
            $.ajax(settings);

        };  // end getYelp

    }  // end viewmodel

    // this from knockout docs
    // Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
    // used for details sidebar dropdown panels
    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };

    ko.bindingHandlers.toggleSlide = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            $(element).toggle("slide");
        }
    };

})();