# Description

A jQuery plugin for displaying GitHub user activity in a handsome little widget

[Check out the demo](http://thebinarypenguin.github.io/guaw/)

# Details

- Requires jQuery 1.8 or later
- Uses the GitHub Events API v3
- Displays all available activity (not just the first page)

# Usage

```html
<html>
  <head>
    <!-- Include the plugin stylesheet -->
    <link href="css/guaw.css" rel="stylesheet">
  </head>
  <body>
    <!-- Create a container -->
    <div id="widget-container"></div>

    <!-- Include jQuery and the plugin -->
    <script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="js/guaw.js"></script>
    <script>
      $(function(){

        // Activate the plugin
        $('#widget-container').guaw({
          username: 'thebinarypenguin',   // The GitHub user
          timeout: 180,                   // Time to wait (in seconds) between API requests, optional, default 300
          debug: true                     // Output debug info to the console, optional, default false
        });

      });
    </script>
  </body>
</html>
```
