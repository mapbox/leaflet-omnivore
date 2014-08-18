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
