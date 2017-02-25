/**
 * Created by jsherman on 1/20/17.
 */

    (function() {

        // View Model
        var weather;
        var darkSkyAPI = "https://api.darksky.net/forecast/5253877f6a8235bbb4323b0a1a70239a/40.7466891,-73.8908579";
        // weather data in responseJSON object

            $.ajax({
                url : darkSkyAPI,
                data : {
                    "format" : "json"
                },
                dataType : "jsonp",
                success: function(data){
                    console.log('ajax request success\n' + data );
                    // Weather(data);
                    weather = new Weather(data);
                    displayIcon(weather.getIcon());
                    ko.applyBindings(weather, document.getElementById('weather'));
                },
                error : function () {
                    console.log('ajax request failed.');
                    var header = document.getElementById('weather');
                    header.innerHTML = 'Sorry no weather data, please check your internet connection.'
                }
            });


        // ko model only one object
        var Weather = function(data) {
            this.summary = ko.observable(data.currently.summary);
            this.icon = data.currently.icon;
            this.getIcon = function () {
                return this.icon;
            };
            this.rainProb =  ko.observable(data.currently.precipProbability);
            this.temp =  ko.computed(function () {
                return Math.round(data.currently.temperature)
            } );
            this.tempFeel =  ko.computed(function () {
                return Math.round(data.currently.apparentTemperature)
            } );
            this.dailySummary =  ko.observable(data.daily.summary);
            // this.weatherImg = ko.computed(displayIcon(this.icon)).extend({ deferred: true });
            this.weatherImg = displayIcon(this.icon);
        };

        var weatherIcons = {
            "rain" : 'img/SVG/Cloud-Rain.svg',
            "snow" : 'img/SVG/Cloud-Snow.svg',
            "sleet" : 'img/SVG/Cloud-Hail-Alt.svg',
            "hail" : 'img/SVG/Cloud-Hail-Alt.svg',
            "wind" : 'img/SVG/Wind.svg',
            "fog" : 'img/SVG/Cloud-Fog-Alt.svg',
            "cloudy" : 'img/SVG/Cloud.svg',
            "partly_cloudy_day" : 'img/SVG/Cloud-Sun.svg',
            "partly_cloudy_night" : 'img/SVG/Cloud-Moon.svg',
            "clear_day" : 'img/SVG/Sun.svg',
            "clear_night" : 'img/SVG/Moon.svg'
        };

        function displayIcon(icon) {
            if (icon === 'rain') {
                return weatherIcons.rain;
            } else if (icon === 'snow') {
                return weatherIcons.snow;
            } else if (icon === 'sleet') {
                return weatherIcons.sleet;
            } else if (icon === 'hail') {
                return weatherIcons.sleet;
            } else if (icon === 'wind') {
                return weatherIcons.wind;
            } else if (icon === 'fog') {
                return weatherIcons.fog;
            } else if (icon === 'cloudy') {
                return weatherIcons.cloudy;
            } else if (icon === 'partly-cloudy-day') {
                return weatherIcons.partly_cloudy_day;
            } else if (icon === 'partly-cloudy-night') {
                return weatherIcons.partly_cloudy_night;
            } else if (icon === 'clear') {
                return weatherIcons.clear_day;
            } else if (icon === 'clear-day') {
                return weatherIcons.clear_day;
            } else if (icon === 'clear-night') {
                return weatherIcons.clear_night;
            }
            return weatherIcons.cloudy;
        }

    })();

