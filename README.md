# leaflet-omnivore

Multi-format support for [Leaflet](http://leafletjs.com/).

Currently supports:

* [CSV](http://en.wikipedia.org/wiki/Comma-separated_values) (via [csv2geojson](https://github.com/mapbox/csv2geojson))
* GPX (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [KML](http://developers.google.com/kml/documentation/) (via [toGeoJSON](https://github.com/mapbox/togeojson))
* [WKT](http://en.wikipedia.org/wiki/Well-known_text) (via [wellknown](https://github.com/mapbox/wellknown))

## example

```js
var map = L.mapbox.map('map', 'examples.map-9ijuk24y')
    .setView([38, -102.0], 5);

omnivore.csv('a.csv').addTo(map);
omnivore.gpx('a.gpx').addTo(map);
omnivore.kml('a.kml').addTo(map);
omnivore.wkt('a.wkt').addTo(map);
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
