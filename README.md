# leaflet-omnivore

Multi-format support for [Leaflet](http://leafletjs.com/).

## example

```js
omnivore.csv('a.csv').addTo(map);
```

## api

* `.csv(url)`: Load CSV file at URL, parse CSV, and return layer.
* `.csv.parse(csvString)`: Parse CSV, and return layer.
* `.kml(url)`: Load KML file at URL, parse KML, and return layer.
* `.kml.parse(csvString)`: Parse KML, and return layer.
* `.gpx(url)`: Load GPX file at URL, parse GPX, and return layer.
* `.gpx.parse(csvString)`: Parse GPX, and return layer.
* `.geojson(url)`: Load GeoJSON file at URL, parse GeoJSON, and return layer.
