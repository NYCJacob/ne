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
- Admittedly the site could use some better visual design.

**Acknowledgments**
- As always much help was found on Stackoverflow and Udacity discussion forums.
- http://jsfiddle.net/SittingFox/nr8tr5oo/  for showing single infoWindow + ko template
- https://zellwk.com/books/  Gulp book was great to up my Gulp skills
- HTML5 boilerplate - I removed a lot of the code but didn't want to go the Bootstrap route
- Udacity/Google maps course example code
- https://forecast.ion  weather data api
- https://data.cityofnewyork.us/
-