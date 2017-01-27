/**
 * Created by jsherman on 1/20/17.
 */


    (function() {

        // View Model
        var weather;
        var darkSkyAPI = "https://api.darksky.net/forecast/5253877f6a8235bbb4323b0a1a70239a/40.7466891,-73.8908579";
        // weather data in responseJSON object
        var darkSkyData =
            $.ajax({
                url : darkSkyAPI,
                data : {
                    "format" : "json"
                },
                dataType : "jsonp",
                success: function(data){
                    console.log('ajax request success\n' + data );
                    // Weather(data);
                    // weather = new Weather(data);
                    weather = data;

                },
                error : function () {console.log('ajax request failed.');}
            });


        // ko model only one object
        // class not needed ???
        // var Weather;
        // Weather = function(data) {
        //     this.summary = data.currently.summary;
        //     this.icon = data.currently.icon;
        //     this.rainProb =  data.currently.precipProbability;
        //     this.temp =  data.currently.temperature;
        //     this.tempFeel =  data.currently.apparentTemperature;
        // };

    })();

