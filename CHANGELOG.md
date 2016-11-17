## 0.3.4

* From now on, the repository doesn't contain leaflet-omnivore.js or leaflet-omnivore.min.js. Those
  files will be in the npm package and you can use unpkg.com to get them.

## 0.3.3

* Call either `setGeoJSON` or `addData` on GeoJSON layers, not both.

## 0.3.2

* Move `brfs` and `hintify` to dependencies.

## 0.3.1

* Updates [wellknown](https://github.com/mapbox/wellknown) to 0.3.0 with exponent coordinate support
* Updates [togeojson](https://github.com/mapbox/togeojson) to 0.10.1 with timestamp, ie9 feature id, gx:Track, gx:MultiTrack support

## 0.3.0

* Includes [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) support.

## 0.2.0

* Only includes the necessary parts of [TopoJSON](https://github.com/mbostock/topojson): less bytes,
  and **IE9** and **IE10** are now supported.
* Tests now use Sauce Labs and run on real browsers for every commit.
* Builds now use an `npm` script rather than a Makefile.

## 0.1.0

* loader functions now support a `customLayer` option for providing options to
  `L.geoJson` or using a different layer type.

## 0.0.1

* `gpx.parse` and `kml.parse` support parsing from either strings or DOM objects
