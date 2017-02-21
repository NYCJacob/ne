**Intro**

Restaurant Map mashup using Google place data, Yelp data and NYC restaurant health inspection data.
Also, uses weather api from forceast.io.  Built as a platform to incorporate other data and easily expandable 
to other neighborhoods by allowing the user to input a location.  However, only NYC has the graded inspection
system as far as I know.  

**Using the app.**
- the app initially presents you with a google map centered on Jackson Heights with the current weather
displayed in the header and list of restaurants in a left sidebar.
- The side bar has a search box at the top that filters the list and corresponding map icons.
- Clicking either an item on the list or a corresponding map icon will do the following
    - an infowindow showing restaurant name, google rating, google price level,
    hours, open now and website.  All data in the infowindow is from Google Places API
    - right side bar slides out displaying further details from Google, NYC Socrata data, and Yelp
    - the left sidebar list goes off-screen when details location is clicked and returns
    when the details sidebar is closed.
-  Would like to integrate a restaurant menu api but could not find one with good coverage for NYC.
- Admittedly the site could use some better visual design.

**Known issues**
- During the build process constant undefined errors occurred when minifying and 
concating js files.  Issue probably is Jquery and/or Knockout.  For now I decided not
to minify the vendor files while I continue investigating the issue
- Gulp HTML minifier removed white space used in weather header.  Therefore whitespace
unicode is used in the weather header.
- further details could be provided when right sidebar details are clicked.  
For example, lots of NYC inspection data is being recieved but not displayed.
- No link to go to Yelp.com


**Acknowledgments**
- As always much help was found on Stackoverflow and Udacity discussion forums.
- http://jsfiddle.net/SittingFox/nr8tr5oo/  for showing single infoWindow + ko template
- https://zellwk.com/books/  Gulp book was great to up my Gulp skills
- HTML5 boilerplate - I removed a lot of the code but didn't want to go the Bootstrap route
- Udacity/Google maps course example code
- https://forecast.ion  weather data api
- https://data.cityofnewyork.us/
- https://www.yelp.com/