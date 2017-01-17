/**
 * Created by jsherman on 1/16/17.
 */
/*global Backbone */
var app = app || {};

(function () {
    'use strict';

    // Restaurant Model
    // ----------

    // Our basic restaurant based on google place response object
    //  see https://developers.google.com/maps/documentation/javascript/places#place_search_responses
    app.Todo = Backbone.Model.extend({
        // Default attributes for the restaurant
        defaults: {
            geometry : {},
            icon : "",
            id : "",
            name : "",
            opening_hours : {},
            photos : [],
            place_id : "",
            price_level : null,
            rating : null,
            types : []
        }
    });
})();