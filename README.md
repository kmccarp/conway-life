Conway's Game of Life
===========
This is an HTML5 rendering of [Conway's Game of Life](http://en.wikipedia.org/wiki/Conway%27s_game_of_life).

There are a few ways to run this. First, clone the repository.

### Python
If you have Python, running it is as simple as navigating to the directory you cloned into and typing

``python -m SimpleHTTPServer``

Navigate to [http://localhost:8000/](http://localhost:8000/) and you're good to go!


### PHP
If you have PHP 5.4 or newer installed, you can navigate to the directory you cloned into and type

``php -S localhost:8000``

Navigate to [http://localhost:8000/](http://localhost:8000/) and you're good to go!

If have PHP 5.3 or older, you'll need a web server (see Apache section)

### Apache (or any stack that includes Apache, e.g. LAMP, WAMP, XAMPP)
Clone the repository (or copy the cloned repository) into a subfolder of your web apps directory (usually called 'htdocs', within the installation directory of Apache), like "conway-life" (my example will assume you called it this) and navigate to [http://localhost/conway-life](http://localhost/conway-life)!
