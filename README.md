# Description

A jQuery plugin for displaying GitHub user activity in a handsome little widget

[Check out the demo](http://thebinarypenguin.github.io/guaw/)

# Details

- Requires jQuery 1.8 or later
- Uses the GitHub Events API v3
- Displays all available activity (not just the first page)
- Uses conditional requests to save bandwidth
- Rate-limits itself by respecting the X-Poll-Interval response header

# Optional Dependency

GUAW checks for the presence of date libraries such as [Moment.js](http://momentjs.com) or the
[jQuery timeago plugin](http://timeago.yarp.com/) and if it finds one will use it to display fuzzy
relative dates. If no date library is found it will fall back to the US-centric date format of
month-day-year

# Usage

```html
<html>
  <head>
    <!-- Include the plugin stylesheet -->
    <link href="css/jquery.guaw.min.css" rel="stylesheet">
  </head>
  <body>
    <!-- Create a container -->
    <div id="widget-container"></div>

    <!-- Include jQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>

    <!-- Optionally include Moment.js or the jQuery timeago plugin here -->

    <!-- Include GUAW -->
    <script src="js/jquery.guaw.min.js"></script>
    <script>
      $(function(){

        // Activate the plugin
        $('#widget-container').guaw({
          username: 'thebinarypenguin',  // The GitHub user
          timeout: 180,                  // Time to wait (in seconds) between API requests, optional, default 300
          debug: true                    // Output debug info to the console, optional, default false
        });

      });
    </script>
  </body>
</html>
```
