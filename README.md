# leaflet-omnivore

[Leaflet](http://leafletjs.com/) supports the [GeoJSON](http://geojson.org/) format
by default. What if you have something else? That's where omnivore comes in.

It currently supports:

* [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) (via [csv2geojson](https://github.com/mapbox/csv2geojson))
* GPX (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [KML](http://developers.google.com/kml/documentation/) (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [WKT](http://en.wikipedia.org/wiki/Well-known_text) (via [wellknown](https://github.com/mapbox/wellknown))
* [TopoJSON](https://github.com/mbostock/topojson)

Omnivore also includes an AJAX library, [corslite](https://github.com/mapbox/corslite),
so you can specify what you want to add to the map with just a URL.

## example

```js
var map = L.mapbox.map('map', 'examples.map-9ijuk24y')
    .setView([38, -102.0], 5);

omnivore.csv('a.csv').addTo(map);
omnivore.gpx('a.gpx').addTo(map);
omnivore.kml('a.kml').addTo(map);
omnivore.wkt('a.wkt').addTo(map);
omnivore.topojson('a.topojson').addTo(map);
omnivore.geojson('a.geojson').addTo(map);
```

## api

* `.csv(url)`: Load & parse CSV, and return layer.
* `.csv.parse(csvString)`: Parse CSV, and return layer.
* `.kml(url)`: Load & parse KML, and return layer.
* `.kml.parse(kmlString)`: Parse KML, and return layer.
* `.gpx(url)`: Load & parse GPX, and return layer.
* `.gpx.parse(gpxString)`: Parse GPX, and return layer.
* `.geojson(url)`: Load GeoJSON file at URL, parse GeoJSON, and return layer.
* `.wkt(url)`: Load & parse WKT, and return layer.
* `.wkt.parse(wktString)`: Parse WKT, and return layer.
* `.topojson(url)`: Load & parse TopoJSON, and return layer.
* `.topojson.parse(topojson)`: Parse TopoJSON (given as a string or object), and return layer.

## FAQ

* **What if I just want one format?** Lucky for you, each format is specified
  in a different module, so you can just use csv2geojson, wellknown, or toGeoJSON
  individually.
* **My AJAX request is failing for a cross-domain request**. Read up on the [Same Origin Restriction](http://en.wikipedia.org/wiki/Same-origin_policy).
  By default, we use corslite, so cross-domain requests will try to use [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
  if your server and browser supports it, but if one of them doesn't, there's no
  way on the internet to support your request.
* **Why isn't JSONP supported?** [Here's why](https://gist.github.com/tmcw/6244497).
