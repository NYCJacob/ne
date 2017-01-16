/**
 * Created by jsherman on 1/15/17.
 */

require({
    waitSeconds : 120, //make sure it is enough to load all gmaps scripts
    paths : {
        async : 'vendor/requirejs-plugins/src/async' //alias to plugin
    }
});
// you can use a "!callbackName" at the end of the URL
// to specify name of parameter that expects callback function name
// the default value is "!callback" if not present.

require(
    [
        'async!https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyBinHw_1SkBR4Otshx5nnA_KSuT_kNwk0g&v=3'
    ],
    function() {
        //Google maps is available and all components are ready to use.
        // Create a styles array to use with the map.
        function initMap() {
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

            var mapDiv = document.getElementById('map');
            var neighborhood = {lat: 40.7556818, lng: -73.8830701};
            var map = new google.maps.Map(mapDiv, {
                center: neighborhood,
                zoom: 14,
                styles: styles,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                navigationControl: true,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                }
            });
            // based on google map place search api example
            // https://developers.google.com/maps/documentation/javascript/examples/place-search
            infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: neighborhood,
                radius: 500,
                type: ['restaurant']
            }, callback);
        }

        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    console.log(results[i]);
                    createMarker(results[i]);
                }
            }
        }

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
                 map: map,
                 icon: icon,
                 title: place.name,
                 position: place.geometry.location,
                 id: place.place_id
             });

        //     // google.maps.event.addListener(marker, 'click', function() {
        //     //     infowindow.setContent(place.name);
        //     //     infowindow.open(map, this);
        //     // });
         }
        
        initMap();
    }

);


