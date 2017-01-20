/**
 * Created by jsherman on 1/20/17.
 */
window.myWidgetParam = {
    id: 9,
    cityid: 4891010,
    appid: 'ff58a74b7a0939cd34d96dc917a5a0d6',
    containerid: 'openweathermap-widget',
};
(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'http://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js';
    var s = document.getElementById('openweathermap-widget');
    s.parentNode.insertBefore(script, s);
})();
