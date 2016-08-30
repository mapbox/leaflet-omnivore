[![Circle CI](https://circleci.com/gh/fuzhenn/maptalks.formats.svg?style=shield)](https://circleci.com/gh/fuzhenn/maptalks.formats)

# maptalks.formats

This is a work based on [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore). All credits go to it.

A maptalks.js's plugin for geographic data format supports.

It currently supports:

* [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) (via [csv2geojson](https://github.com/mapbox/csv2geojson))
* GPX (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [KML](http://developers.google.com/kml/documentation/) (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [WKT](http://en.wikipedia.org/wiki/Well-known_text) (via [wellknown](https://github.com/mapbox/wellknown))
* [TopoJSON](https://github.com/mbostock/topojson)
* [Encoded Polylines](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) via [polyline](https://github.com/mapbox/polyline)

It also includes an AJAX library, [corslite](https://github.com/mapbox/corslite),
so you can specify what you want to add to the map with just a URL.

## Installation

download `leaflet-omnivore.min.js` from this repository.

or

```
npm install maptalks.formats --save
```

## example

```js
var map = new maptalks.Map('map', ...);

maptalks.Formats.csv('a.csv').addTo(map);
maptalks.Formats.gpx('a.gpx').addTo(map);
maptalks.Formats.kml('a.kml').addTo(map);
maptalks.Formats.wkt('a.wkt').addTo(map);
maptalks.Formats.topojson('a.topojson').addTo(map);
maptalks.Formats.geojson('a.geojson').addTo(map);
maptalks.Formats.polyline('a.txt').addTo(map);
```

## API

Arguments with `?` are optional. **parser_options** consists of options
sent to the parser library, _not_ to the layer: if you want to provide options
to the layer, see the example in the Custom Layers section.

By default, the library will construct a `maptalks.GeoJSONLayer` layer internally and
call `.addData(geojson)` on it in order to load it full of GeoJSON. :


* `.csv(url, parser_options?, customLayer?)`: Load & parse CSV, and return layer. Options are the same as [csv2geojson](https://github.com/mapbox/csv2geojson#api): `latfield, lonfield, delimiter`
* `.csv.parse(csvString, parser_options?)`: Parse CSV, and return layer.
* `.kml(url)`: Load & parse KML, and return layer.
* `.kml.parse(kmlString | gpxDom)`: Parse KML from a string of XML or XML DOM, and return layer.
* `.gpx(url, parser_options?, customLayer?)`: Load & parse GPX, and return layer.
* `.gpx.parse(gpxString | gpxDom)`: Parse GPX from a string of XML or XML DOM, and return layer.
* `.geojson(url, parser_options?, customLayer?)`: Load GeoJSON file at URL, parse GeoJSON, and return layer.
* `.wkt(url, parser_options?, customLayer?)`: Load & parse WKT, and return layer.
* `.wkt.parse(wktString)`: Parse WKT, and return layer.
* `.topojson(url, parser_options?, customLayer?)`: Load & parse TopoJSON, and return layer.
* `.topojson.parse(topojson)`: Parse TopoJSON (given as a string or object), and return layer.
* `.polyline(url, parser_options?, customLayer?)`: Load & parse polyline, and return layer.
* `.polyline.parse(txt, options, layer)`: Parse polyline (given as a string or object), and return layer.

Valid options:

#### polyline

* `precision` will change how the polyline is interpreted. By default, the value
  is 5. This is the [factor in the algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm),
  by default 1e5, which is adjustable.


### Async & Events

Each function returns an `maptalks.GeoJSONLayer` object. Functions that load from URLs
are **asynchronous**, so they will **not** be immediately loaded.

For this reason, we fire events:

* `ready`: fired when all data is loaded into the layer
* `error`: fired if data can't be loaded or parsed

```js
var layer = maptalks.Formats.gpx('a.gpx')
    .on('ready', function() {
        // when this is fired, the layer
        // is done being initialized
    })
    .on('error', function() {
        // fired if the layer can't be loaded over AJAX
        // or can't be parsed
    })
    .addTo(map);
```

`ready` does **not** fire if you don't use an asynchronous form of the function
like `.topojson.parse()`: because you don't need an event. Just run your code
after the call.

## Development

This is a [browserify](http://browserify.org/) project:

```sh
git clone git@github.com:maptalks/maptalks.formats.git

cd maptalks.formats

# to run tests
npm install

# to build maptalks.formats.js
npm run build
```

`maptalks.formats.js` and `maptalks.formats.min.js` are **built files** generated
from `index.js` by `browserify`. If you find an issue, it either needs to be
fixed in `index.js`, or in one of the libraries leaflet-omnivore uses
to parse formats.

## FAQ

* **What if I just want one format?** Lucky for you, each format is specified
  in a different module, so you can just use [TopoJSON](https://github.com/mbostock/topojson),
  [csv2geojson](https://github.com/mapbox/csv2geojson), [wellknown](https://github.com/mapbox/wellknown), or
  [toGeoJSON](https://github.com/mapbox/togeojson)
  individually.
* **My AJAX request is failing for a cross-domain request**. Read up on the [Same Origin Restriction](http://en.wikipedia.org/wiki/Same-origin_policy).
  By default, we use corslite, so cross-domain requests will try to use [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
  if your server and browser supports it, but if one of them doesn't, there's no
  way on the internet to support your request.
* **Why isn't JSONP supported?** [Here's why](https://gist.github.com/tmcw/6244497).
