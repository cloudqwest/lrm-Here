Leaflet Routing Machine / HERE
=====================================


Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Here](https://developer.here.com/rest-apis/documentation/routing/topics/overview.html) routing API.

Some brief instructions follow below, but the [Leaflet Routing Machine tutorial on alternative routers](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) is recommended.

## Installing

Go to the [download page](http://www.liedman.net/lrm-graphhopper/download/) to get the script to include in your page. Put the script after Leaflet and Leaflet Routing Machine has been loaded.

To use with for example Browserify:

```sh
npm install --save lrm-here
```

## Using

There's a single class exported by this module, `L.Routing.Here`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-here'); // This will tack on the class to the L.Routing namespace

L.Routing.control({
    router: new L.Routing.Here('your Here app id', 'your Here app code'),
}).addTo(map);
```

Note that you will need to pass a valid Here app code and app id to the constructor.
