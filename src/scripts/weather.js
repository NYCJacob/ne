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
                    ko.applyBindings(weather, document.getElementById('weather'));
                },
                error : function () {console.log('ajax request failed.');}
            });


        // ko model only one object
        // class not needed ???
        var Weather = function(data) {
            this.summary = ko.observable(data.currently.summary);
            this.icon = ko.observable(data.currently.icon);
            this.rainProb =  ko.observable(data.currently.precipProbability);
            this.temp =  ko.observable(data.currently.temperature);
            this.tempFeel =  ko.observable(data.currently.apparentTemperature);
            this.dailySummary =  ko.observable(data.daily.summary);
            this.getIcon = displayIcon(this.icon);
        };

        //TODO: make the weatherIcons object work with the Weather class

        // Weather.getIcon = displayIcon;
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
            if (this.icon === 'rain') {
                return weatherIcons.rain;
            } else if (this.icon === 'snow') {
                return weatherIcons.snow;
            } else if (this.icon === 'sleet') {
                return weatherIcons.sleet;
            } else if (this.icon === 'hail') {
                return weatherIcons.sleet;
            } else if (this.icon === 'wind') {
                return weatherIcons.wind;
            } else if (this.icon === 'fog') {
                return weatherIcons.fog;
            } else if (this.icon === 'cloudy') {
                return weatherIcons.cloudy;
            } else if (this.icon === 'partly-cloudy-day') {
                return weatherIcons.partly_cloudy_day;
            } else if (this.icon === 'partly-cloudy-night') {
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

