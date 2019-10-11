[![CircleCI](https://circleci.com/gh/maptalks/maptalks.formats/tree/master.svg?style=shield)](https://circleci.com/gh/maptalks/maptalks.formats/)
[![NPM Version](https://img.shields.io/npm/v/maptalks.formats.svg)](https://github.com/maptalks/maptalks.formats)

# maptalks.formats

This is a work inspired by [leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore). 

A maptalks.js's plugin for geographic data format supports, convert various data formats to GeoJSON.

It currently supports:

* [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) (via [csv2geojson](https://github.com/mapbox/csv2geojson))
* GPX (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [KML](http://developers.google.com/kml/documentation/) (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [WKT](http://en.wikipedia.org/wiki/Well-known_text) (via [wellknown](https://github.com/mapbox/wellknown))
* [TopoJSON](https://github.com/mbostock/topojson)
* [OSM](https://wiki.openstreetmap.org/wiki/OSM_file_formats)
* [Encoded Polylines](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) via [polyline](https://github.com/mapbox/polyline)


## Installation

download `maptalks.formats.min.js` from this repository.

or

```
npm install maptalks.formats --save
```

## example

```js
maptalks.Formats.geojson('a.geojson', function (err, geojson) { });
maptalks.Formats.csv('a.csv', function (err, geojson) { });
maptalks.Formats.gpx('a.gpx', function (err, geojson) { });
maptalks.Formats.kml('a.kml', function (err, geojson) { });
maptalks.Formats.wkt('a.wkt', function (err, geojson) { });
maptalks.Formats.osm('osm.osm', function (err, geojson) { });
maptalks.Formats.topojson('a.topojson', function (err, geojson) { });
maptalks.Formats.polyline('a.txt', function (err, geojson) { });
```

## API

Arguments with `?` are optional. **parser_options** consists of options
sent to the parser library:


* `.csv(url, parser_options?, callback)`: Load & parse CSV. Options are the same as [csv2geojson](https://github.com/mapbox/csv2geojson#api): `latfield, lonfield, delimiter`
* `.csv.parse(csvString, parser_options?, callback)`: Parse CSV, and return layer.
* `.kml(url, callback)`: Load & parse KML.
* `.kml.parse(kmlString | gpxDom)`: Parse KML from a string of XML or XML DOM.
* `.gpx(url, callback)`: Load & parse GPX.
* `.gpx.parse(gpxString | gpxDom)`: Parse GPX from a string of XML or XML DOM.
* `.geojson(url, callback)`: Load GeoJSON file at URL, parse GeoJSON.
* `.wkt(url, callback)`: Load & parse WKT.
* `.wkt.parse(wktString)`: Parse WKT.
* `.topojson(url, callback)`: Load & parse TopoJSON.
* `.topojson.parse(topojson)`: Parse TopoJSON (given as a string or object).
* `.osm(url, callback)`: Parse OSM & Converts OSM XML to GeoJSON.
* `.polyline(url, parser_options?, callback)`: Load & parse polyline.
* `.polyline.parse(txt, options)`: Parse polyline (given as a string or object).

Valid options:

#### polyline

* `precision` will change how the polyline is interpreted. By default, the value
  is 5. This is the [factor in the algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm),
  by default 1e5, which is adjustable.


### Async & Events

Each function returns an `maptalks.Formats` instance. Functions that load from URLs
are **asynchronous**, so they will **not** be immediately loaded.

```js
var map = new maptalks.Map('map', options);

maptalks.Formats.gpx('a.gpx', function (err, geojson) {
    // callback when loaded
    new maptalks.VectorLayer('gpx', geojson).addTo(map);
});
```


## Development

```sh
git clone git@github.com:maptalks/maptalks.formats.git

cd maptalks.formats

# to run tests
npm install

# to build maptalks.formats.js
npm run build
```

`maptalks.formats.js` and `maptalks.formats.min.js` are **built files** generated
from `index.js` by `rollup`. If you find an issue, it either needs to be
fixed in `index.js`, or in one of the libraries maptalks.formats uses
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
