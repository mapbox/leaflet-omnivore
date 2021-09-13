/*!
 * maptalks.formats v0.3.0
 * LICENSE : BSD-3-Clause
 * (c) 2016-2021 maptalks.org
 */
/*!
 * requires maptalks@^0.25.0 
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function (name, i) {
    return JSON.stringify(name) + ": d[" + i + "]";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function (row, i) {
    return f(object(row), i, columns);
  };
}

function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function (row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

var dsv$1 = function (delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n]"),
      delimiterCode = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert,
        columns,
        rows = parseRows(text, function (row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns;
    return rows;
  }

  function parseRows(text, f) {
    var EOL = {},
        EOF = {},
        rows = [],
        N = text.length,
        I = 0,
        n = 0,
        t,
        eol;

    function token() {
      if (I >= N) return EOF;
      if (eol) return eol = false, EOL;
      var j = I,
          c;
      if (text.charCodeAt(j) === 34) {
        var i = j;
        while (i++ < N) {
          if (text.charCodeAt(i) === 34) {
            if (text.charCodeAt(i + 1) !== 34) break;
            ++i;
          }
        }
        I = i + 2;
        c = text.charCodeAt(i + 1);
        if (c === 13) {
          eol = true;
          if (text.charCodeAt(i + 2) === 10) ++I;
        } else if (c === 10) {
          eol = true;
        }
        return text.slice(j + 1, i).replace(/""/g, "\"");
      }

      while (I < N) {
        var k = 1;
        c = text.charCodeAt(I++);
        if (c === 10) eol = true;else if (c === 13) {
            eol = true;if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
        return text.slice(j, I - k);
      }

      return text.slice(j);
    }

    while ((t = token()) !== EOF) {
      var a = [];
      while (t !== EOL && t !== EOF) {
        a.push(t);
        t = token();
      }
      if (f && (a = f(a, n++)) == null) continue;
      rows.push(a);
    }

    return rows;
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function (row) {
      return columns.map(function (column) {
        return formatValue(row[column]);
      }).join(delimiter);
    })).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return text == null ? "" : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\"" : text;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatRows: formatRows
  };
};

var csv = dsv$1(",");

var csvParse$1 = csv.parse;
var csvParseRows = csv.parseRows;
var csvFormat = csv.format;
var csvFormatRows = csv.formatRows;

var tsv = dsv$1("\t");

var tsvParse = tsv.parse;
var tsvParseRows = tsv.parseRows;
var tsvFormat = tsv.format;
var tsvFormatRows = tsv.formatRows;



var index$1 = Object.freeze({
	dsvFormat: dsv$1,
	csvParse: csvParse$1,
	csvParseRows: csvParseRows,
	csvFormat: csvFormat,
	csvFormatRows: csvFormatRows,
	tsvParse: tsvParse,
	tsvParseRows: tsvParseRows,
	tsvFormat: tsvFormat,
	tsvFormatRows: tsvFormatRows
});

var index$2 = element;
var pair_1 = pair;
var format_1 = format;
var formatPair_1 = formatPair;
var coordToDMS_1 = coordToDMS;

function element(input, dims) {
  var result = search(input, dims);
  return result === null ? null : result.val;
}

function formatPair(input) {
  return format(input.lat, 'lat') + ' ' + format(input.lon, 'lon');
}

function format(input, dim) {
  var dms = coordToDMS(input, dim);
  return dms.whole + '° ' + (dms.minutes ? dms.minutes + '\' ' : '') + (dms.seconds ? dms.seconds + '" ' : '') + dms.dir;
}

function coordToDMS(input, dim) {
  var dirs = { lat: ['N', 'S'], lon: ['E', 'W'] }[dim] || '';
  var dir = dirs[input >= 0 ? 0 : 1];
  var abs = Math.abs(input);
  var whole = Math.floor(abs);
  var fraction = abs - whole;
  var fractionMinutes = fraction * 60;
  var minutes = Math.floor(fractionMinutes);
  var seconds = Math.floor((fractionMinutes - minutes) * 60);

  return {
    whole: whole,
    minutes: minutes,
    seconds: seconds,
    dir: dir
  };
}

function search(input, dims) {
  if (!dims) dims = 'NSEW';
  if (typeof input !== 'string') return null;

  input = input.toUpperCase();
  var regex = /^[\s\,]*([NSEW])?\s*([\-|\—|\―]?[0-9.]+)[°º˚]?\s*(?:([0-9.]+)['’′‘]\s*)?(?:([0-9.]+)(?:''|"|”|″)\s*)?([NSEW])?/;

  var m = input.match(regex);
  if (!m) return null;

  var matched = m[0];

  var dim;
  if (m[1] && m[5]) {
    dim = m[1];
    matched = matched.slice(0, -1);
  } else {
    dim = m[1] || m[5];
  }

  if (dim && dims.indexOf(dim) === -1) return null;

  var deg = m[2] ? parseFloat(m[2]) : 0;
  var min = m[3] ? parseFloat(m[3]) / 60 : 0;
  var sec = m[4] ? parseFloat(m[4]) / 3600 : 0;
  var sign = deg < 0 ? -1 : 1;
  if (dim === 'S' || dim === 'W') sign *= -1;

  return {
    val: (Math.abs(deg) + min + sec) * sign,
    dim: dim,
    matched: matched,
    remain: input.slice(matched.length)
  };
}

function pair(input, dims) {
  input = input.trim();
  var one = search(input, dims);
  if (!one) return null;

  input = one.remain.trim();
  var two = search(input, dims);
  if (!two || two.remain) return null;

  if (one.dim) {
    return swapdim(one.val, two.val, one.dim);
  } else {
    return [one.val, two.val];
  }
}

function swapdim(a, b, dim) {
  if (dim === 'N' || dim === 'S') return [a, b];
  if (dim === 'W' || dim === 'E') return [b, a];
}

index$2.pair = pair_1;
index$2.format = format_1;
index$2.formatPair = formatPair_1;
index$2.coordToDMS = coordToDMS_1;

var require$$0 = ( index$1 && undefined ) || index$1;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

















var defaults = function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

var dsv = require$$0;
var sexagesimal = index$2;

var latRegex = /(Lat)(itude)?/gi;
var lonRegex = /(L)(on|ng)(gitude)?/i;

function guessHeader(row, regexp) {
    var name, match, score;
    for (var f in row) {
        match = f.match(regexp);
        if (match && (!name || match[0].length / f.length > score)) {
            score = match[0].length / f.length;
            name = f;
        }
    }
    return name;
}

function guessLatHeader(row) {
    return guessHeader(row, latRegex);
}
function guessLonHeader(row) {
    return guessHeader(row, lonRegex);
}

function isLat(f) {
    return !!f.match(latRegex);
}
function isLon(f) {
    return !!f.match(lonRegex);
}

function keyCount(o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) == 'object' ? Object.keys(o).length : 0;
}

function autoDelimiter(x) {
    var delimiters = [',', ';', '\t', '|'];
    var results = [];

    delimiters.forEach(function (delimiter) {
        var res = dsv.dsvFormat(delimiter).parse(x);
        if (res.length >= 1) {
            var count = keyCount(res[0]);
            for (var i = 0; i < res.length; i++) {
                if (keyCount(res[i]) !== count) return;
            }
            results.push({
                delimiter: delimiter,
                arity: Object.keys(res[0]).length
            });
        }
    });

    if (results.length) {
        return results.sort(function (a, b) {
            return b.arity - a.arity;
        })[0].delimiter;
    } else {
        return null;
    }
}

function deleteColumns(x) {
    delete x.columns;
    return x;
}

function auto(x) {
    var delimiter = autoDelimiter(x);
    if (!delimiter) return null;
    return deleteColumns(dsv.dsvFormat(delimiter).parse(x));
}

function csv2geojson(x, options, callback) {

    if (!callback) {
        callback = options;
        options = {};
    }

    options.delimiter = options.delimiter || ',';

    var latfield = options.latfield || '',
        lonfield = options.lonfield || '',
        crs = options.crs || '';

    var features = [],
        featurecollection = { type: 'FeatureCollection', features: features };

    if (crs !== '') {
        featurecollection.crs = { type: 'name', properties: { name: crs } };
    }

    if (options.delimiter === 'auto' && typeof x == 'string') {
        options.delimiter = autoDelimiter(x);
        if (!options.delimiter) {
            callback({
                type: 'Error',
                message: 'Could not autodetect delimiter'
            });
            return;
        }
    }

    var numericFields = options.numericFields ? options.numericFields.split(',') : null;

    var parsed = typeof x == 'string' ? dsv.dsvFormat(options.delimiter).parse(x, function (d) {
        if (numericFields) {
            for (var key in d) {
                if (numericFields.includes(key)) {
                    d[key] = +d[key];
                }
            }
        }
        return d;
    }) : x;

    if (!parsed.length) {
        callback(null, featurecollection);
        return;
    }

    var errors = [];
    var i;

    if (!latfield) latfield = guessLatHeader(parsed[0]);
    if (!lonfield) lonfield = guessLonHeader(parsed[0]);
    var noGeometry = !latfield || !lonfield;

    if (noGeometry) {
        for (i = 0; i < parsed.length; i++) {
            features.push({
                type: 'Feature',
                properties: parsed[i],
                geometry: null
            });
        }
        callback(errors.length ? errors : null, featurecollection);
        return;
    }

    for (i = 0; i < parsed.length; i++) {
        if (parsed[i][lonfield] !== undefined && parsed[i][latfield] !== undefined) {

            var lonk = parsed[i][lonfield],
                latk = parsed[i][latfield],
                lonf,
                latf,
                a;

            a = sexagesimal(lonk, 'EW');
            if (a) lonk = a;
            a = sexagesimal(latk, 'NS');
            if (a) latk = a;

            lonf = parseFloat(lonk);
            latf = parseFloat(latk);

            if (isNaN(lonf) || isNaN(latf)) {
                errors.push({
                    message: 'A row contained an invalid value for latitude or longitude',
                    row: parsed[i],
                    index: i
                });
            } else {
                if (!options.includeLatLon) {
                    delete parsed[i][lonfield];
                    delete parsed[i][latfield];
                }

                features.push({
                    type: 'Feature',
                    properties: parsed[i],
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lonf), parseFloat(latf)]
                    }
                });
            }
        }
    }

    callback(errors.length ? errors : null, featurecollection);
}

function toLine(gj) {
    var features = gj.features;
    var line = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: []
        }
    };
    for (var i = 0; i < features.length; i++) {
        line.geometry.coordinates.push(features[i].geometry.coordinates);
    }
    line.properties = features.reduce(function (aggregatedProperties, newFeature) {
        for (var key in newFeature.properties) {
            if (!aggregatedProperties[key]) {
                aggregatedProperties[key] = [];
            }
            aggregatedProperties[key].push(newFeature.properties[key]);
        }
        return aggregatedProperties;
    }, {});
    return {
        type: 'FeatureCollection',
        features: [line]
    };
}

function toPolygon(gj) {
    var features = gj.features;
    var poly = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[]]
        }
    };
    for (var i = 0; i < features.length; i++) {
        poly.geometry.coordinates[0].push(features[i].geometry.coordinates);
    }
    poly.properties = features.reduce(function (aggregatedProperties, newFeature) {
        for (var key in newFeature.properties) {
            if (!aggregatedProperties[key]) {
                aggregatedProperties[key] = [];
            }
            aggregatedProperties[key].push(newFeature.properties[key]);
        }
        return aggregatedProperties;
    }, {});
    return {
        type: 'FeatureCollection',
        features: [poly]
    };
}

var index = {
    isLon: isLon,
    isLat: isLat,
    guessLatHeader: guessLatHeader,
    guessLonHeader: guessLonHeader,
    csv: dsv.csvParse,
    tsv: dsv.tsvParse,
    dsv: dsv,
    auto: auto,
    csv2geojson: csv2geojson,
    toLine: toLine,
    toPolygon: toPolygon
};

var index$4 = parse;
var parse_1 = parse;
var stringify_1 = stringify;

var numberRegexp = /[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/;

var tuples = new RegExp('^' + numberRegexp.source + '(\\s' + numberRegexp.source + '){1,}');

function parse(input) {
  var parts = input.split(';');
  var _ = parts.pop();
  var srid = (parts.shift() || '').split('=').pop();

  var i = 0;

  function $(re) {
    var match = _.substring(i).match(re);
    if (!match) return null;else {
      i += match[0].length;
      return match[0];
    }
  }

  function crs(obj) {
    if (obj && srid.match(/\d+/)) {
      obj.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:EPSG::' + srid
        }
      };
    }

    return obj;
  }

  function white() {
    $(/^\s*/);
  }

  function multicoords() {
    white();
    var depth = 0;
    var rings = [];
    var stack = [rings];
    var pointer = rings;
    var elem;

    while (elem = $(/^(\()/) || $(/^(\))/) || $(/^(\,)/) || $(tuples)) {
      if (elem === '(') {
        stack.push(pointer);
        pointer = [];
        stack[stack.length - 1].push(pointer);
        depth++;
      } else if (elem === ')') {
        if (pointer.length === 0) return null;

        pointer = stack.pop();

        if (!pointer) return null;
        depth--;
        if (depth === 0) break;
      } else if (elem === ',') {
        pointer = [];
        stack[stack.length - 1].push(pointer);
      } else if (!elem.split(/\s/g).some(isNaN)) {
        Array.prototype.push.apply(pointer, elem.split(/\s/g).map(parseFloat));
      } else {
        return null;
      }
      white();
    }

    if (depth !== 0) return null;

    return rings;
  }

  function coords() {
    var list = [];
    var item;
    var pt;
    while (pt = $(tuples) || $(/^(\,)/)) {
      if (pt === ',') {
        list.push(item);
        item = [];
      } else if (!pt.split(/\s/g).some(isNaN)) {
        if (!item) item = [];
        Array.prototype.push.apply(item, pt.split(/\s/g).map(parseFloat));
      }
      white();
    }

    if (item) list.push(item);else return null;

    return list.length ? list : null;
  }

  function point() {
    if (!$(/^(point)/i)) return null;
    white();
    if (!$(/^(\()/)) return null;
    var c = coords();
    if (!c) return null;
    white();
    if (!$(/^(\))/)) return null;
    return {
      type: 'Point',
      coordinates: c[0]
    };
  }

  function multipoint() {
    if (!$(/^(multipoint)/i)) return null;
    white();
    var newCoordsFormat = _.substring(_.indexOf('(') + 1, _.length - 1).replace(/\(/g, '').replace(/\)/g, '');
    _ = 'MULTIPOINT (' + newCoordsFormat + ')';
    var c = multicoords();
    if (!c) return null;
    white();
    return {
      type: 'MultiPoint',
      coordinates: c
    };
  }

  function multilinestring() {
    if (!$(/^(multilinestring)/i)) return null;
    white();
    var c = multicoords();
    if (!c) return null;
    white();
    return {
      type: 'MultiLineString',
      coordinates: c
    };
  }

  function linestring() {
    if (!$(/^(linestring)/i)) return null;
    white();
    if (!$(/^(\()/)) return null;
    var c = coords();
    if (!c) return null;
    if (!$(/^(\))/)) return null;
    return {
      type: 'LineString',
      coordinates: c
    };
  }

  function polygon() {
    if (!$(/^(polygon)/i)) return null;
    white();
    var c = multicoords();
    if (!c) return null;
    return {
      type: 'Polygon',
      coordinates: c
    };
  }

  function multipolygon() {
    if (!$(/^(multipolygon)/i)) return null;
    white();
    var c = multicoords();
    if (!c) return null;
    return {
      type: 'MultiPolygon',
      coordinates: c
    };
  }

  function geometrycollection() {
    var geometries = [];
    var geometry;

    if (!$(/^(geometrycollection)/i)) return null;
    white();

    if (!$(/^(\()/)) return null;
    while (geometry = root()) {
      geometries.push(geometry);
      white();
      $(/^(\,)/);
      white();
    }
    if (!$(/^(\))/)) return null;

    return {
      type: 'GeometryCollection',
      geometries: geometries
    };
  }

  function root() {
    return point() || linestring() || polygon() || multipoint() || multilinestring() || multipolygon() || geometrycollection();
  }

  return crs(root());
}

function stringify(gj) {
  if (gj.type === 'Feature') {
    gj = gj.geometry;
  }

  function pairWKT(c) {
    return c.join(' ');
  }

  function ringWKT(r) {
    return r.map(pairWKT).join(', ');
  }

  function ringsWKT(r) {
    return r.map(ringWKT).map(wrapParens).join(', ');
  }

  function multiRingsWKT(r) {
    return r.map(ringsWKT).map(wrapParens).join(', ');
  }

  function wrapParens(s) {
    return '(' + s + ')';
  }

  switch (gj.type) {
    case 'Point':
      return 'POINT (' + pairWKT(gj.coordinates) + ')';
    case 'LineString':
      return 'LINESTRING (' + ringWKT(gj.coordinates) + ')';
    case 'Polygon':
      return 'POLYGON (' + ringsWKT(gj.coordinates) + ')';
    case 'MultiPoint':
      return 'MULTIPOINT (' + ringWKT(gj.coordinates) + ')';
    case 'MultiPolygon':
      return 'MULTIPOLYGON (' + multiRingsWKT(gj.coordinates) + ')';
    case 'MultiLineString':
      return 'MULTILINESTRING (' + ringsWKT(gj.coordinates) + ')';
    case 'GeometryCollection':
      return 'GEOMETRYCOLLECTION (' + gj.geometries.map(stringify).join(', ') + ')';
    default:
      throw new Error('stringify requires a valid GeoJSON Feature or geometry object as input');
  }
}

index$4.parse = parse_1;
index$4.stringify = stringify_1;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var polyline_1 = createCommonjsModule(function (module) {
    'use strict';

    var polyline = {};

    function py2_round(value) {
        return Math.floor(Math.abs(value) + 0.5) * Math.sign(value);
    }

    function encode(current, previous, factor) {
        current = py2_round(current * factor);
        previous = py2_round(previous * factor);
        var coordinate = current - previous;
        coordinate <<= 1;
        if (current - previous < 0) {
            coordinate = ~coordinate;
        }
        var output = '';
        while (coordinate >= 0x20) {
            output += String.fromCharCode((0x20 | coordinate & 0x1f) + 63);
            coordinate >>= 5;
        }
        output += String.fromCharCode(coordinate + 63);
        return output;
    }

    polyline.decode = function (str, precision) {
        var index = 0,
            lat = 0,
            lng = 0,
            coordinates = [],
            shift = 0,
            result = 0,
            byte = null,
            latitude_change,
            longitude_change,
            factor = Math.pow(10, precision || 5);

        while (index < str.length) {
            byte = null;
            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

            shift = result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lat / factor, lng / factor]);
        }

        return coordinates;
    };

    polyline.encode = function (coordinates, precision) {
        if (!coordinates.length) {
            return '';
        }

        var factor = Math.pow(10, precision || 5),
            output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);

        for (var i = 1; i < coordinates.length; i++) {
            var a = coordinates[i],
                b = coordinates[i - 1];
            output += encode(a[0], b[0], factor);
            output += encode(a[1], b[1], factor);
        }

        return output;
    };

    function flipped(coords) {
        var flipped = [];
        for (var i = 0; i < coords.length; i++) {
            flipped.push(coords[i].slice().reverse());
        }
        return flipped;
    }

    polyline.fromGeoJSON = function (geojson, precision) {
        if (geojson && geojson.type === 'Feature') {
            geojson = geojson.geometry;
        }
        if (!geojson || geojson.type !== 'LineString') {
            throw new Error('Input must be a GeoJSON LineString');
        }
        return polyline.encode(flipped(geojson.coordinates), precision);
    };

    polyline.toGeoJSON = function (str, precision) {
        var coords = polyline.decode(str, precision);
        return {
            type: 'LineString',
            coordinates: flipped(coords)
        };
    };

    if ('object' === 'object' && module.exports) {
        module.exports = polyline;
    }
});

var identity = function (x) {
  return x;
};

var transform = function (transform) {
  if (transform == null) return identity;
  var x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function (input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2,
        n = input.length,
        output = new Array(n);
    output[0] = (x0 += input[0]) * kx + dx;
    output[1] = (y0 += input[1]) * ky + dy;
    while (j < n) {
      output[j] = input[j], ++j;
    }return output;
  };
};

var reverse = function (array, n) {
  var t,
      j = array.length,
      i = j - n;
  while (i < --j) {
    t = array[i], array[i++] = array[j], array[j] = t;
  }
};

var topoFeature = function (topology, o) {
  return o.type === "GeometryCollection" ? { type: "FeatureCollection", features: o.geometries.map(function (o) {
      return feature(topology, o);
    }) } : feature(topology, o);
};

function feature(topology, o) {
  var id = o.id,
      bbox = o.bbox,
      properties = o.properties == null ? {} : o.properties,
      geometry = object(topology, o);
  return id == null && bbox == null ? { type: "Feature", properties: properties, geometry: geometry } : bbox == null ? { type: "Feature", id: id, properties: properties, geometry: geometry } : { type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry };
}

function object(topology, o) {
  var transformPoint = transform(topology.transform),
      arcs = topology.arcs;

  function arc(i, points) {
    if (points.length) points.pop();
    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
      points.push(transformPoint(a[k], k));
    }
    if (i < 0) reverse(points, n);
  }

  function point(p) {
    return transformPoint(p);
  }

  function line(arcs) {
    var points = [];
    for (var i = 0, n = arcs.length; i < n; ++i) {
      arc(arcs[i], points);
    }if (points.length < 2) points.push(points[0]);
    return points;
  }

  function ring(arcs) {
    var points = line(arcs);
    while (points.length < 4) {
      points.push(points[0]);
    }
    return points;
  }

  function polygon(arcs) {
    return arcs.map(ring);
  }

  function geometry(o) {
    var type = o.type,
        coordinates;
    switch (type) {
      case "GeometryCollection":
        return { type: type, geometries: o.geometries.map(geometry) };
      case "Point":
        coordinates = point(o.coordinates);break;
      case "MultiPoint":
        coordinates = o.coordinates.map(point);break;
      case "LineString":
        coordinates = line(o.arcs);break;
      case "MultiLineString":
        coordinates = o.arcs.map(line);break;
      case "Polygon":
        coordinates = polygon(o.arcs);break;
      case "MultiPolygon":
        coordinates = o.arcs.map(polygon);break;
      default:
        return null;
    }
    return { type: type, coordinates: coordinates };
  }

  return geometry(o);
}

var bisect = function (a, x) {
  var lo = 0,
      hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) lo = mid + 1;else hi = mid;
  }
  return lo;
};

var hashset = function (size, hash, equal, type, empty) {
  if (arguments.length === 3) {
    type = Array;
    empty = null;
  }

  var store = new type(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    store[i] = empty;
  }

  function add(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) return true;
      if (++collisions >= size) throw new Error("full hashset");
      match = store[index = index + 1 & mask];
    }
    store[index] = value;
    return true;
  }

  function has(value) {
    var index = hash(value) & mask,
        match = store[index],
        collisions = 0;
    while (match != empty) {
      if (equal(match, value)) return true;
      if (++collisions >= size) break;
      match = store[index = index + 1 & mask];
    }
    return false;
  }

  function values() {
    var values = [];
    for (var i = 0, n = store.length; i < n; ++i) {
      var match = store[i];
      if (match != empty) values.push(match);
    }
    return values;
  }

  return {
    add: add,
    has: has,
    values: values
  };
};

var hashmap = function (size, hash, equal, keyType, keyEmpty, valueType) {
  if (arguments.length === 3) {
    keyType = valueType = Array;
    keyEmpty = null;
  }

  var keystore = new keyType(size = 1 << Math.max(4, Math.ceil(Math.log(size) / Math.LN2))),
      valstore = new valueType(size),
      mask = size - 1;

  for (var i = 0; i < size; ++i) {
    keystore[i] = keyEmpty;
  }

  function set(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index] = value;
      if (++collisions >= size) throw new Error("full hashmap");
      matchKey = keystore[index = index + 1 & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function maybeSet(key, value) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index];
      if (++collisions >= size) throw new Error("full hashmap");
      matchKey = keystore[index = index + 1 & mask];
    }
    keystore[index] = key;
    valstore[index] = value;
    return value;
  }

  function get(key, missingValue) {
    var index = hash(key) & mask,
        matchKey = keystore[index],
        collisions = 0;
    while (matchKey != keyEmpty) {
      if (equal(matchKey, key)) return valstore[index];
      if (++collisions >= size) break;
      matchKey = keystore[index = index + 1 & mask];
    }
    return missingValue;
  }

  function keys() {
    var keys = [];
    for (var i = 0, n = keystore.length; i < n; ++i) {
      var matchKey = keystore[i];
      if (matchKey != keyEmpty) keys.push(matchKey);
    }
    return keys;
  }

  return {
    set: set,
    maybeSet: maybeSet,
    get: get,
    keys: keys
  };
};

var equalPoint = function (pointA, pointB) {
  return pointA[0] === pointB[0] && pointA[1] === pointB[1];
};

var buffer = new ArrayBuffer(16);
var floats = new Float64Array(buffer);
var uints = new Uint32Array(buffer);

var hashPoint = function (point) {
  floats[0] = point[0];
  floats[1] = point[1];
  var hash = uints[0] ^ uints[1];
  hash = hash << 5 ^ hash >> 7 ^ uints[2] ^ uints[3];
  return hash & 0x7fffffff;
};

var join = function (topology) {
  var coordinates = topology.coordinates,
      lines = topology.lines,
      rings = topology.rings,
      indexes = index(),
      visitedByIndex = new Int32Array(coordinates.length),
      leftByIndex = new Int32Array(coordinates.length),
      rightByIndex = new Int32Array(coordinates.length),
      junctionByIndex = new Int8Array(coordinates.length),
      junctionCount = 0,
      i,
      n,
      previousIndex,
      currentIndex,
      nextIndex;

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = leftByIndex[i] = rightByIndex[i] = -1;
  }

  for (i = 0, n = lines.length; i < n; ++i) {
    var line = lines[i],
        lineStart = line[0],
        lineEnd = line[1];
    currentIndex = indexes[lineStart];
    nextIndex = indexes[++lineStart];
    ++junctionCount, junctionByIndex[currentIndex] = 1;
    while (++lineStart <= lineEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[lineStart]);
    }
    ++junctionCount, junctionByIndex[nextIndex] = 1;
  }

  for (i = 0, n = coordinates.length; i < n; ++i) {
    visitedByIndex[i] = -1;
  }

  for (i = 0, n = rings.length; i < n; ++i) {
    var ring = rings[i],
        ringStart = ring[0] + 1,
        ringEnd = ring[1];
    previousIndex = indexes[ringEnd - 1];
    currentIndex = indexes[ringStart - 1];
    nextIndex = indexes[ringStart];
    sequence(i, previousIndex, currentIndex, nextIndex);
    while (++ringStart <= ringEnd) {
      sequence(i, previousIndex = currentIndex, currentIndex = nextIndex, nextIndex = indexes[ringStart]);
    }
  }

  function sequence(i, previousIndex, currentIndex, nextIndex) {
    if (visitedByIndex[currentIndex] === i) return;
    visitedByIndex[currentIndex] = i;
    var leftIndex = leftByIndex[currentIndex];
    if (leftIndex >= 0) {
      var rightIndex = rightByIndex[currentIndex];
      if ((leftIndex !== previousIndex || rightIndex !== nextIndex) && (leftIndex !== nextIndex || rightIndex !== previousIndex)) {
        ++junctionCount, junctionByIndex[currentIndex] = 1;
      }
    } else {
      leftByIndex[currentIndex] = previousIndex;
      rightByIndex[currentIndex] = nextIndex;
    }
  }

  function index() {
    var indexByPoint = hashmap(coordinates.length * 1.4, hashIndex, equalIndex, Int32Array, -1, Int32Array),
        indexes = new Int32Array(coordinates.length);

    for (var i = 0, n = coordinates.length; i < n; ++i) {
      indexes[i] = indexByPoint.maybeSet(i, i);
    }

    return indexes;
  }

  function hashIndex(i) {
    return hashPoint(coordinates[i]);
  }

  function equalIndex(i, j) {
    return equalPoint(coordinates[i], coordinates[j]);
  }

  visitedByIndex = leftByIndex = rightByIndex = null;

  var junctionByPoint = hashset(junctionCount * 1.4, hashPoint, equalPoint),
      j;

  for (i = 0, n = coordinates.length; i < n; ++i) {
    if (junctionByIndex[j = indexes[i]]) {
      junctionByPoint.add(coordinates[j]);
    }
  }

  return junctionByPoint;
};

function rotateArray(array, start, end, offset) {
  reverse$1(array, start, end);
  reverse$1(array, start, start + offset);
  reverse$1(array, start + offset, end);
}

function reverse$1(array, start, end) {
  for (var mid = start + (end-- - start >> 1), t; start < mid; ++start, --end) {
    t = array[start], array[start] = array[end], array[end] = t;
  }
}

var identity$1 = function (x) {
  return x;
};

var transform$1 = function (transform) {
  if (transform == null) return identity$1;
  var x0,
      y0,
      kx = transform.scale[0],
      ky = transform.scale[1],
      dx = transform.translate[0],
      dy = transform.translate[1];
  return function (input, i) {
    if (!i) x0 = y0 = 0;
    var j = 2,
        n = input.length,
        output = new Array(n);
    output[0] = (x0 += input[0]) * kx + dx;
    output[1] = (y0 += input[1]) * ky + dy;
    while (j < n) {
      output[j] = input[j], ++j;
    }return output;
  };
};

var bisect$1 = function (a, x) {
  var lo = 0,
      hi = a.length;
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (a[mid] < x) lo = mid + 1;else hi = mid;
  }
  return lo;
};

var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
var nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^' + nameStartChar.source + nameChar.source + '*(?:\:' + nameStartChar.source + nameChar.source + '*)?$');

var S_TAG = 0;
var S_ATTR = 1;
var S_ATTR_SPACE = 2;
var S_EQ = 3;
var S_ATTR_NOQUOT_VALUE = 4;
var S_ATTR_END = 5;
var S_TAG_SPACE = 6;
var S_TAG_CLOSE = 7;

function XMLReader() {}

XMLReader.prototype = {
	parse: function parse(source, defaultNSMap, entityMap) {
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap, defaultNSMap = {});
		_parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
		domBuilder.endDocument();
	}
};
function _parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
	function fixedFromCharCode(code) {
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10),
			    surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a) {
		var k = a.slice(1, -1);
		if (k in entityMap) {
			return entityMap[k];
		} else if (k.charAt(0) === '#') {
			return fixedFromCharCode(parseInt(k.substr(1).replace('x', '0x')));
		} else {
			errorHandler.error('entity not found:' + a);
			return a;
		}
	}
	function appendText(end) {
		if (end > start) {
			var xt = source.substring(start, end).replace(/&#?\w+;/g, entityReplacer);
			locator && position(start);
			domBuilder.characters(xt, 0, end - start);
			start = end;
		}
	}
	function position(p, m) {
		while (p >= lineEnd && (m = linePattern.exec(source))) {
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
		}
		locator.columnNumber = p - lineStart + 1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g;
	var locator = domBuilder.locator;

	var parseStack = [{ currentNSMap: defaultNSMapCopy }];
	var closeMap = {};
	var start = 0;
	while (true) {
		try {
			var tagStart = source.indexOf('<', start);
			if (tagStart < 0) {
				if (!source.substr(start).match(/^\s*$/)) {
					var doc = domBuilder.doc;
					var text = doc.createTextNode(source.substr(start));
					doc.appendChild(text);
					domBuilder.currentElement = text;
				}
				return;
			}
			if (tagStart > start) {
				appendText(tagStart);
			}
			switch (source.charAt(tagStart + 1)) {
				case '/':
					var end = source.indexOf('>', tagStart + 3);
					var tagName = source.substring(tagStart + 2, end);
					var config = parseStack.pop();
					if (end < 0) {

						tagName = source.substring(tagStart + 2).replace(/[\s<].*/, '');

						errorHandler.error("end tag name: " + tagName + ' is not complete:' + config.tagName);
						end = tagStart + 1 + tagName.length;
					} else if (tagName.match(/\s</)) {
						tagName = tagName.replace(/[\s<].*/, '');
						errorHandler.error("end tag name: " + tagName + ' maybe not complete');
						end = tagStart + 1 + tagName.length;
					}

					var localNSMap = config.localNSMap;
					var endMatch = config.tagName == tagName;
					var endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
					if (endIgnoreCaseMach) {
						domBuilder.endElement(config.uri, config.localName, tagName);
						if (localNSMap) {
							for (var prefix in localNSMap) {
								domBuilder.endPrefixMapping(prefix);
							}
						}
						if (!endMatch) {
							errorHandler.fatalError("end tag name: " + tagName + ' is not match the current start tagName:' + config.tagName);
						}
					} else {
						parseStack.push(config);
					}

					end++;
					break;

				case '?':
					locator && position(tagStart);
					end = parseInstruction(source, tagStart, domBuilder);
					break;
				case '!':
					locator && position(tagStart);
					end = parseDCC(source, tagStart, domBuilder, errorHandler);
					break;
				default:
					locator && position(tagStart);
					var el = new ElementAttributes();
					var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;

					var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler);
					var len = el.length;

					if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap)) {
						el.closed = true;
						if (!entityMap.nbsp) {
							errorHandler.warning('unclosed xml attribute');
						}
					}
					if (locator && len) {
						var locator2 = copyLocator(locator, {});

						for (var i = 0; i < len; i++) {
							var a = el[i];
							position(a.offset);
							a.locator = copyLocator(locator, {});
						}

						domBuilder.locator = locator2;
						if (appendElement(el, domBuilder, currentNSMap)) {
							parseStack.push(el);
						}
						domBuilder.locator = locator;
					} else {
						if (appendElement(el, domBuilder, currentNSMap)) {
							parseStack.push(el);
						}
					}

					if (el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed) {
						end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
					} else {
						end++;
					}
			}
		} catch (e) {
			errorHandler.error('element parse error: ' + e);

			end = -1;
		}
		if (end > start) {
			start = end;
		} else {
			appendText(Math.max(tagStart, start) + 1);
		}
	}
}
function copyLocator(f, t) {
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;
	while (true) {
		var c = source.charAt(p);
		switch (c) {
			case '=':
				if (s === S_ATTR) {
					attrName = source.slice(start, p);
					s = S_EQ;
				} else if (s === S_ATTR_SPACE) {
					s = S_EQ;
				} else {
					throw new Error('attribute equal must after attrName');
				}
				break;
			case '\'':
			case '"':
				if (s === S_EQ || s === S_ATTR) {
						if (s === S_ATTR) {
							errorHandler.warning('attribute value must after "="');
							attrName = source.slice(start, p);
						}
						start = p + 1;
						p = source.indexOf(c, start);
						if (p > 0) {
							value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
							el.add(attrName, value, start - 1);
							s = S_ATTR_END;
						} else {
							throw new Error('attribute value no end \'' + c + '\' match');
						}
					} else if (s == S_ATTR_NOQUOT_VALUE) {
					value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);

					el.add(attrName, value, start);

					errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ')!!');
					start = p + 1;
					s = S_ATTR_END;
				} else {
					throw new Error('attribute value must after "="');
				}
				break;
			case '/':
				switch (s) {
					case S_TAG:
						el.setTagName(source.slice(start, p));
					case S_ATTR_END:
					case S_TAG_SPACE:
					case S_TAG_CLOSE:
						s = S_TAG_CLOSE;
						el.closed = true;
					case S_ATTR_NOQUOT_VALUE:
					case S_ATTR:
					case S_ATTR_SPACE:
						break;

					default:
						throw new Error("attribute invalid close char('/')");
				}
				break;
			case '':
				errorHandler.error('unexpected end of input');
				if (s == S_TAG) {
					el.setTagName(source.slice(start, p));
				}
				return p;
			case '>':
				switch (s) {
					case S_TAG:
						el.setTagName(source.slice(start, p));
					case S_ATTR_END:
					case S_TAG_SPACE:
					case S_TAG_CLOSE:
						break;
					case S_ATTR_NOQUOT_VALUE:
					case S_ATTR:
						value = source.slice(start, p);
						if (value.slice(-1) === '/') {
							el.closed = true;
							value = value.slice(0, -1);
						}
					case S_ATTR_SPACE:
						if (s === S_ATTR_SPACE) {
							value = attrName;
						}
						if (s == S_ATTR_NOQUOT_VALUE) {
							errorHandler.warning('attribute "' + value + '" missed quot(")!!');
							el.add(attrName, value.replace(/&#?\w+;/g, entityReplacer), start);
						} else {
							if (currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)) {
								errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
							}
							el.add(value, value, start);
						}
						break;
					case S_EQ:
						throw new Error('attribute value missed!!');
				}

				return p;

			case "\x80":
				c = ' ';
			default:
				if (c <= ' ') {
					switch (s) {
						case S_TAG:
							el.setTagName(source.slice(start, p));
							s = S_TAG_SPACE;
							break;
						case S_ATTR:
							attrName = source.slice(start, p);
							s = S_ATTR_SPACE;
							break;
						case S_ATTR_NOQUOT_VALUE:
							var value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
							errorHandler.warning('attribute "' + value + '" missed quot(")!!');
							el.add(attrName, value, start);
						case S_ATTR_END:
							s = S_TAG_SPACE;
							break;
					}
				} else {
					switch (s) {
						case S_ATTR_SPACE:
							var tagName = el.tagName;
							if (currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
								errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
							}
							el.add(attrName, attrName, start);
							start = p;
							s = S_ATTR;
							break;
						case S_ATTR_END:
							errorHandler.warning('attribute space is required"' + attrName + '"!!');
						case S_TAG_SPACE:
							s = S_ATTR;
							start = p;
							break;
						case S_EQ:
							s = S_ATTR_NOQUOT_VALUE;
							start = p;
							break;
						case S_TAG_CLOSE:
							throw new Error("elements closed character '/' and '>' must be connected to");
					}
				}
		}
		p++;
	}
}

function appendElement(el, domBuilder, currentNSMap) {
	var tagName = el.tagName;
	var localNSMap = null;

	var i = el.length;
	while (i--) {
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if (nsp > 0) {
			var prefix = a.prefix = qName.slice(0, nsp);
			var localName = qName.slice(nsp + 1);
			var nsPrefix = prefix === 'xmlns' && localName;
		} else {
			localName = qName;
			prefix = null;
			nsPrefix = qName === 'xmlns' && '';
		}

		a.localName = localName;

		if (nsPrefix !== false) {
			if (localNSMap == null) {
				localNSMap = {};

				_copy(currentNSMap, currentNSMap = {});
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/';
			domBuilder.startPrefixMapping(nsPrefix, value);
		}
	}
	var i = el.length;
	while (i--) {
		a = el[i];
		var prefix = a.prefix;
		if (prefix) {
			if (prefix === 'xml') {
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if (prefix !== 'xmlns') {
				a.uri = currentNSMap[prefix || ''];
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if (nsp > 0) {
		prefix = el.prefix = tagName.slice(0, nsp);
		localName = el.localName = tagName.slice(nsp + 1);
	} else {
		prefix = null;
		localName = el.localName = tagName;
	}

	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns, localName, tagName, el);

	if (el.closed) {
		domBuilder.endElement(ns, localName, tagName);
		if (localNSMap) {
			for (prefix in localNSMap) {
				domBuilder.endPrefixMapping(prefix);
			}
		}
	} else {
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;

		return true;
	}
}
function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
	if (/^(?:script|textarea)$/i.test(tagName)) {
		var elEndStart = source.indexOf('</' + tagName + '>', elStartEnd);
		var text = source.substring(elStartEnd + 1, elEndStart);
		if (/[&<]/.test(text)) {
			if (/^script$/i.test(tagName)) {
				domBuilder.characters(text, 0, text.length);

				return elEndStart;
			}
			text = text.replace(/&#?\w+;/g, entityReplacer);
			domBuilder.characters(text, 0, text.length);
			return elEndStart;
		}
	}
	return elStartEnd + 1;
}
function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
	var pos = closeMap[tagName];
	if (pos == null) {
		pos = source.lastIndexOf('</' + tagName + '>');
		if (pos < elStartEnd) {
			pos = source.lastIndexOf('</' + tagName);
		}
		closeMap[tagName] = pos;
	}
	return pos < elStartEnd;
}
function _copy(source, target) {
	for (var n in source) {
		target[n] = source[n];
	}
}
function parseDCC(source, start, domBuilder, errorHandler) {
	var next = source.charAt(start + 2);
	switch (next) {
		case '-':
			if (source.charAt(start + 3) === '-') {
				var end = source.indexOf('-->', start + 4);

				if (end > start) {
					domBuilder.comment(source, start + 4, end - start - 4);
					return end + 3;
				} else {
					errorHandler.error("Unclosed comment");
					return -1;
				}
			} else {
				return -1;
			}
		default:
			if (source.substr(start + 3, 6) == 'CDATA[') {
				var end = source.indexOf(']]>', start + 9);
				domBuilder.startCDATA();
				domBuilder.characters(source, start + 9, end - start - 9);
				domBuilder.endCDATA();
				return end + 3;
			}

			var matchs = split(source, start);
			var len = matchs.length;
			if (len > 1 && /!doctype/i.test(matchs[0][0])) {
				var name = matchs[1][0];
				var pubid = len > 3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
				var sysid = len > 4 && matchs[4][0];
				var lastMatch = matchs[len - 1];
				domBuilder.startDTD(name, pubid && pubid.replace(/^(['"])(.*?)\1$/, '$2'), sysid && sysid.replace(/^(['"])(.*?)\1$/, '$2'));
				domBuilder.endDTD();

				return lastMatch.index + lastMatch[0].length;
			}
	}
	return -1;
}

function parseInstruction(source, start, domBuilder) {
	var end = source.indexOf('?>', start);
	if (end) {
		var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if (match) {
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]);
			return end + 2;
		} else {
			return -1;
		}
	}
	return -1;
}

function ElementAttributes(source) {}
ElementAttributes.prototype = {
	setTagName: function setTagName(tagName) {
		if (!tagNamePattern.test(tagName)) {
			throw new Error('invalid tagName:' + tagName);
		}
		this.tagName = tagName;
	},
	add: function add(qName, value, offset) {
		if (!tagNamePattern.test(qName)) {
			throw new Error('invalid attribute:' + qName);
		}
		this[this.length++] = { qName: qName, value: value, offset: offset };
	},
	length: 0,
	getLocalName: function getLocalName(i) {
		return this[i].localName;
	},
	getLocator: function getLocator(i) {
		return this[i].locator;
	},
	getQName: function getQName(i) {
		return this[i].qName;
	},
	getURI: function getURI(i) {
		return this[i].uri;
	},
	getValue: function getValue(i) {
		return this[i].value;
	}
};

function _set_proto_(thiz, parent) {
	defaults(thiz, parent);

	return thiz;
}
if (!(_set_proto_({}, _set_proto_.prototype) instanceof _set_proto_)) {
	_set_proto_ = function _set_proto_(thiz, parent) {
		function p() {}
		p.prototype = parent;
		p = new p();
		for (parent in thiz) {
			p[parent] = thiz[parent];
		}
		return p;
	};
}

function split(source, start) {
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);
	while (match = reg.exec(source)) {
		buf.push(match);
		if (match[1]) return buf;
	}
}

var XMLReader_1 = XMLReader;

var sax = {
	XMLReader: XMLReader_1
};

function copy$1(src, dest) {
	for (var p in src) {
		dest[p] = src[p];
	}
}

function _extends$1(Class, Super) {
	var pt = Class.prototype;
	if (Object.create) {
		var ppt = Object.create(Super.prototype);
		defaults(pt, ppt);
	}
	if (!(pt instanceof Super)) {
		var t = function t() {};

		
		t.prototype = Super.prototype;
		t = new t();
		copy$1(pt, t);
		Class.prototype = pt = t;
	}
	if (pt.constructor != Class) {
		if (typeof Class != 'function') {
			console.error("unknow Class:" + Class);
		}
		pt.constructor = Class;
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml';

var NodeType = {};
var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
var TEXT_NODE = NodeType.TEXT_NODE = 3;
var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
var NOTATION_NODE = NodeType.NOTATION_NODE = 12;

var ExceptionCode = {};
var ExceptionMessage = {};
var INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1);
var DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2);
var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3);
var WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4);
var INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5);
var NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7);
var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8);
var NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10);

var INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11);
var SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12);
var INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13);
var NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14);
var INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);

function DOMException(code, message) {
	if (message instanceof Error) {
		var error = message;
	} else {
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if (message) this.message = this.message + ": " + message;
	return error;
}
DOMException.prototype = Error.prototype;
copy$1(ExceptionCode, DOMException);

function NodeList() {}
NodeList.prototype = {
	length: 0,

	item: function item(index) {
		return this[index] || null;
	},
	toString: function toString(isHTML, nodeFilter) {
		for (var buf = [], i = 0; i < this.length; i++) {
			serializeToString(this[i], buf, isHTML, nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node, refresh) {
	this._node = node;
	this._refresh = refresh;
	_updateLiveList(this);
}
function _updateLiveList(list) {
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if (list._inc != inc) {
		var ls = list._refresh(list._node);

		__set__(list, 'length', ls.length);
		copy$1(ls, list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function (i) {
	_updateLiveList(this);
	return this[i];
};

_extends$1(LiveNodeList, NodeList);

function NamedNodeMap() {}

function _findNodeIndex(list, node) {
	var i = list.length;
	while (i--) {
		if (list[i] === node) {
			return i;
		}
	}
}

function _addNamedNode(el, list, newAttr, oldAttr) {
	if (oldAttr) {
		list[_findNodeIndex(list, oldAttr)] = newAttr;
	} else {
		list[list.length++] = newAttr;
	}
	if (el) {
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if (doc) {
			oldAttr && _onRemoveAttribute(doc, el, oldAttr);
			_onAddAttribute(doc, el, newAttr);
		}
	}
}
function _removeNamedNode(el, list, attr) {
	var i = _findNodeIndex(list, attr);
	if (i >= 0) {
		var lastIndex = list.length - 1;
		while (i < lastIndex) {
			list[i] = list[++i];
		}
		list.length = lastIndex;
		if (el) {
			var doc = el.ownerDocument;
			if (doc) {
				_onRemoveAttribute(doc, el, attr);
				attr.ownerElement = null;
			}
		}
	} else {
		throw DOMException(NOT_FOUND_ERR, new Error(el.tagName + '@' + attr));
	}
}
NamedNodeMap.prototype = {
	length: 0,
	item: NodeList.prototype.item,
	getNamedItem: function getNamedItem(key) {
		var i = this.length;
		while (i--) {
			var attr = this[i];

			if (attr.nodeName == key) {
				return attr;
			}
		}
	},
	setNamedItem: function setNamedItem(attr) {
		var el = attr.ownerElement;
		if (el && el != this._ownerElement) {
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement, this, attr, oldAttr);
		return oldAttr;
	},

	setNamedItemNS: function setNamedItemNS(attr) {
		var el = attr.ownerElement,
		    oldAttr;
		if (el && el != this._ownerElement) {
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
		_addNamedNode(this._ownerElement, this, attr, oldAttr);
		return oldAttr;
	},

	removeNamedItem: function removeNamedItem(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement, this, attr);
		return attr;
	},
	removeNamedItemNS: function removeNamedItemNS(namespaceURI, localName) {
		var attr = this.getNamedItemNS(namespaceURI, localName);
		_removeNamedNode(this._ownerElement, this, attr);
		return attr;
	},
	getNamedItemNS: function getNamedItemNS(namespaceURI, localName) {
		var i = this.length;
		while (i--) {
			var node = this[i];
			if (node.localName == localName && node.namespaceURI == namespaceURI) {
				return node;
			}
		}
		return null;
	}
};

function DOMImplementation(features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			this._features = features[feature];
		}
	}
}

DOMImplementation.prototype = {
	hasFeature: function hasFeature(feature, version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},

	createDocument: function createDocument(namespaceURI, qualifiedName, doctype) {
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if (doctype) {
			doc.appendChild(doctype);
		}
		if (qualifiedName) {
			var root = doc.createElementNS(namespaceURI, qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},

	createDocumentType: function createDocumentType(qualifiedName, publicId, systemId) {
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;

		return node;
	}
};

function Node() {}

Node.prototype = {
	firstChild: null,
	lastChild: null,
	previousSibling: null,
	nextSibling: null,
	attributes: null,
	parentNode: null,
	childNodes: null,
	ownerDocument: null,
	nodeValue: null,
	namespaceURI: null,
	prefix: null,
	localName: null,

	insertBefore: function insertBefore(newChild, refChild) {
		return _insertBefore(this, newChild, refChild);
	},
	replaceChild: function replaceChild(newChild, oldChild) {
		this.insertBefore(newChild, oldChild);
		if (oldChild) {
			this.removeChild(oldChild);
		}
	},
	removeChild: function removeChild(oldChild) {
		return _removeChild(this, oldChild);
	},
	appendChild: function appendChild(newChild) {
		return this.insertBefore(newChild, null);
	},
	hasChildNodes: function hasChildNodes() {
		return this.firstChild != null;
	},
	cloneNode: function cloneNode(deep) {
		return _cloneNode(this.ownerDocument || this, this, deep);
	},

	normalize: function normalize() {
		var child = this.firstChild;
		while (child) {
			var next = child.nextSibling;
			if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
				this.removeChild(next);
				child.appendData(next.data);
			} else {
				child.normalize();
				child = next;
			}
		}
	},

	isSupported: function isSupported(feature, version) {
		return this.ownerDocument.implementation.hasFeature(feature, version);
	},

	hasAttributes: function hasAttributes() {
		return this.attributes.length > 0;
	},
	lookupPrefix: function lookupPrefix(namespaceURI) {
		var el = this;
		while (el) {
			var map = el._nsMap;

			if (map) {
				for (var n in map) {
					if (map[n] == namespaceURI) {
						return n;
					}
				}
			}
			el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
		}
		return null;
	},

	lookupNamespaceURI: function lookupNamespaceURI(prefix) {
		var el = this;
		while (el) {
			var map = el._nsMap;

			if (map) {
				if (prefix in map) {
					return map[prefix];
				}
			}
			el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
		}
		return null;
	},

	isDefaultNamespace: function isDefaultNamespace(namespaceURI) {
		var prefix = this.lookupPrefix(namespaceURI);
		return prefix == null;
	}
};

function _xmlEncoder(c) {
	return c == '<' && '&lt;' || c == '>' && '&gt;' || c == '&' && '&amp;' || c == '"' && '&quot;' || '&#' + c.charCodeAt() + ';';
}

copy$1(NodeType, Node);
copy$1(NodeType, Node.prototype);

function _visitNode(node, callback) {
	if (callback(node)) {
		return true;
	}
	if (node = node.firstChild) {
		do {
			if (_visitNode(node, callback)) {
				return true;
			}
		} while (node = node.nextSibling);
	}
}

function Document() {}
function _onAddAttribute(doc, el, newAttr) {
	doc && doc._inc++;
	var ns = newAttr.namespaceURI;
	if (ns == 'http://www.w3.org/2000/xmlns/') {
		el._nsMap[newAttr.prefix ? newAttr.localName : ''] = newAttr.value;
	}
}
function _onRemoveAttribute(doc, el, newAttr, remove) {
	doc && doc._inc++;
	var ns = newAttr.namespaceURI;
	if (ns == 'http://www.w3.org/2000/xmlns/') {
		delete el._nsMap[newAttr.prefix ? newAttr.localName : ''];
	}
}
function _onUpdateChild(doc, el, newChild) {
	if (doc && doc._inc) {
		doc._inc++;

		var cs = el.childNodes;
		if (newChild) {
			cs[cs.length++] = newChild;
		} else {
			var child = el.firstChild;
			var i = 0;
			while (child) {
				cs[i++] = child;
				child = child.nextSibling;
			}
			cs.length = i;
		}
	}
}

function _removeChild(parentNode, child) {
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if (previous) {
		previous.nextSibling = next;
	} else {
		parentNode.firstChild = next;
	}
	if (next) {
		next.previousSibling = previous;
	} else {
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument, parentNode);
	return child;
}

function _insertBefore(parentNode, newChild, nextChild) {
	var cp = newChild.parentNode;
	if (cp) {
		cp.removeChild(newChild);
	}
	if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	} else {
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;

	if (pre) {
		pre.nextSibling = newFirst;
	} else {
		parentNode.firstChild = newFirst;
	}
	if (nextChild == null) {
		parentNode.lastChild = newLast;
	} else {
		nextChild.previousSibling = newLast;
	}
	do {
		newFirst.parentNode = parentNode;
	} while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
	_onUpdateChild(parentNode.ownerDocument || parentNode, parentNode);

	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode, newChild) {
	var cp = newChild.parentNode;
	if (cp) {
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if (pre) {
		pre.nextSibling = newChild;
	} else {
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
	return newChild;
}
Document.prototype = {
	nodeName: '#document',
	nodeType: DOCUMENT_NODE,
	doctype: null,
	documentElement: null,
	_inc: 1,

	insertBefore: function insertBefore(newChild, refChild) {
		if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
			var child = newChild.firstChild;
			while (child) {
				var next = child.nextSibling;
				this.insertBefore(child, refChild);
				child = next;
			}
			return newChild;
		}
		if (this.documentElement == null && newChild.nodeType == ELEMENT_NODE) {
			this.documentElement = newChild;
		}

		return _insertBefore(this, newChild, refChild), newChild.ownerDocument = this, newChild;
	},
	removeChild: function removeChild(oldChild) {
		if (this.documentElement == oldChild) {
			this.documentElement = null;
		}
		return _removeChild(this, oldChild);
	},

	importNode: function importNode(importedNode, deep) {
		return _importNode(this, importedNode, deep);
	},

	getElementById: function getElementById(id) {
		var rtv = null;
		_visitNode(this.documentElement, function (node) {
			if (node.nodeType == ELEMENT_NODE) {
				if (node.getAttribute('id') == id) {
					rtv = node;
					return true;
				}
			}
		});
		return rtv;
	},

	createElement: function createElement(tagName) {
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs = node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment: function createDocumentFragment() {
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode: function createTextNode(data) {
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createComment: function createComment(data) {
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createCDATASection: function createCDATASection(data) {
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	},
	createProcessingInstruction: function createProcessingInstruction(target, data) {
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue = node.data = data;
		return node;
	},
	createAttribute: function createAttribute(name) {
		var node = new Attr();
		node.ownerDocument = this;
		node.name = name;
		node.nodeName = name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference: function createEntityReference(name) {
		var node = new EntityReference();
		node.ownerDocument = this;
		node.nodeName = name;
		return node;
	},

	createElementNS: function createElementNS(namespaceURI, qualifiedName) {
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs = node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if (pl.length == 2) {
			node.prefix = pl[0];
			node.localName = pl[1];
		} else {
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},

	createAttributeNS: function createAttributeNS(namespaceURI, qualifiedName) {
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if (pl.length == 2) {
			node.prefix = pl[0];
			node.localName = pl[1];
		} else {
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends$1(Document, Node);

function Element() {
	this._nsMap = {};
}
Element.prototype = {
	nodeType: ELEMENT_NODE,
	hasAttribute: function hasAttribute(name) {
		return this.getAttributeNode(name) != null;
	},
	getAttribute: function getAttribute(name) {
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode: function getAttributeNode(name) {
		return this.attributes.getNamedItem(name);
	},
	setAttribute: function setAttribute(name, value) {
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	removeAttribute: function removeAttribute(name) {
		var attr = this.getAttributeNode(name);
		attr && this.removeAttributeNode(attr);
	},

	appendChild: function appendChild(newChild) {
		if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
			return this.insertBefore(newChild, null);
		} else {
			return _appendSingleChild(this, newChild);
		}
	},
	setAttributeNode: function setAttributeNode(newAttr) {
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS: function setAttributeNodeNS(newAttr) {
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode: function removeAttributeNode(oldAttr) {
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},

	removeAttributeNS: function removeAttributeNS(namespaceURI, localName) {
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},

	hasAttributeNS: function hasAttributeNS(namespaceURI, localName) {
		return this.getAttributeNodeNS(namespaceURI, localName) != null;
	},
	getAttributeNS: function getAttributeNS(namespaceURI, localName) {
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS: function setAttributeNS(namespaceURI, qualifiedName, value) {
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr);
	},
	getAttributeNodeNS: function getAttributeNodeNS(namespaceURI, localName) {
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},

	getElementsByTagName: function getElementsByTagName(tagName) {
		return new LiveNodeList(this, function (base) {
			var ls = [];
			_visitNode(base, function (node) {
				if (node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)) {
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS: function getElementsByTagNameNS(namespaceURI, localName) {
		return new LiveNodeList(this, function (base) {
			var ls = [];
			_visitNode(base, function (node) {
				if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)) {
					ls.push(node);
				}
			});
			return ls;
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;

_extends$1(Element, Node);
function Attr() {}
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends$1(Attr, Node);

function CharacterData() {}
CharacterData.prototype = {
	data: '',
	substringData: function substringData(offset, count) {
		return this.data.substring(offset, offset + count);
	},
	appendData: function appendData(text) {
		text = this.data + text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function insertData(offset, text) {
		this.replaceData(offset, 0, text);
	},
	appendChild: function appendChild(newChild) {
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
	},
	deleteData: function deleteData(offset, count) {
		this.replaceData(offset, count, "");
	},
	replaceData: function replaceData(offset, count, text) {
		var start = this.data.substring(0, offset);
		var end = this.data.substring(offset + count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
};
_extends$1(CharacterData, Node);
function Text() {}
Text.prototype = {
	nodeName: "#text",
	nodeType: TEXT_NODE,
	splitText: function splitText(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if (this.parentNode) {
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
};
_extends$1(Text, CharacterData);
function Comment() {}
Comment.prototype = {
	nodeName: "#comment",
	nodeType: COMMENT_NODE
};
_extends$1(Comment, CharacterData);

function CDATASection() {}
CDATASection.prototype = {
	nodeName: "#cdata-section",
	nodeType: CDATA_SECTION_NODE
};
_extends$1(CDATASection, CharacterData);

function DocumentType() {}
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends$1(DocumentType, Node);

function Notation() {}
Notation.prototype.nodeType = NOTATION_NODE;
_extends$1(Notation, Node);

function Entity() {}
Entity.prototype.nodeType = ENTITY_NODE;
_extends$1(Entity, Node);

function EntityReference() {}
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends$1(EntityReference, Node);

function DocumentFragment() {}
DocumentFragment.prototype.nodeName = "#document-fragment";
DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
_extends$1(DocumentFragment, Node);

function ProcessingInstruction() {}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends$1(ProcessingInstruction, Node);
function XMLSerializer$1() {}
XMLSerializer$1.prototype.serializeToString = function (node, isHtml, nodeFilter) {
	return nodeSerializeToString.call(node, isHtml, nodeFilter);
};
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml, nodeFilter) {
	var buf = [];
	var refNode = this.nodeType == 9 ? this.documentElement : this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;

	if (uri && prefix == null) {
		var prefix = refNode.lookupPrefix(uri);
		if (prefix == null) {
			var visibleNamespaces = [{ namespace: uri, prefix: null }];
		}
	}
	serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces);

	return buf.join('');
}
function needNamespaceDefine(node, isHTML, visibleNamespaces) {
	var prefix = node.prefix || '';
	var uri = node.namespaceURI;
	if (!prefix && !uri) {
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" || uri == 'http://www.w3.org/2000/xmlns/') {
		return false;
	}

	var i = visibleNamespaces.length;

	while (i--) {
		var ns = visibleNamespaces[i];

		if (ns.prefix == prefix) {
			return ns.namespace != uri;
		}
	}

	return true;
}
function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
	if (nodeFilter) {
		node = nodeFilter(node);
		if (node) {
			if (typeof node == 'string') {
				buf.push(node);
				return;
			}
		} else {
			return;
		}
	}
	switch (node.nodeType) {
		case ELEMENT_NODE:
			if (!visibleNamespaces) visibleNamespaces = [];
			var startVisibleNamespaces = visibleNamespaces.length;
			var attrs = node.attributes;
			var len = attrs.length;
			var child = node.firstChild;
			var nodeName = node.tagName;

			isHTML = htmlns === node.namespaceURI || isHTML;
			buf.push('<', nodeName);

			for (var i = 0; i < len; i++) {
				var attr = attrs.item(i);
				if (attr.prefix == 'xmlns') {
					visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
				} else if (attr.nodeName == 'xmlns') {
					visibleNamespaces.push({ prefix: '', namespace: attr.value });
				}
			}
			for (var i = 0; i < len; i++) {
				var attr = attrs.item(i);
				if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
					var prefix = attr.prefix || '';
					var uri = attr.namespaceURI;
					var ns = prefix ? ' xmlns:' + prefix : " xmlns";
					buf.push(ns, '="', uri, '"');
					visibleNamespaces.push({ prefix: prefix, namespace: uri });
				}
				serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
			}

			if (needNamespaceDefine(node, isHTML, visibleNamespaces)) {
				var prefix = node.prefix || '';
				var uri = node.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="', uri, '"');
				visibleNamespaces.push({ prefix: prefix, namespace: uri });
			}

			if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
				buf.push('>');

				if (isHTML && /^script$/i.test(nodeName)) {
					while (child) {
						if (child.data) {
							buf.push(child.data);
						} else {
							serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
						}
						child = child.nextSibling;
					}
				} else {
					while (child) {
						serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
						child = child.nextSibling;
					}
				}
				buf.push('</', nodeName, '>');
			} else {
				buf.push('/>');
			}

			return;
		case DOCUMENT_NODE:
		case DOCUMENT_FRAGMENT_NODE:
			var child = node.firstChild;
			while (child) {
				serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces);
				child = child.nextSibling;
			}
			return;
		case ATTRIBUTE_NODE:
			return buf.push(' ', node.name, '="', node.value.replace(/[<&"]/g, _xmlEncoder), '"');
		case TEXT_NODE:
			return buf.push(node.data.replace(/[<&]/g, _xmlEncoder));
		case CDATA_SECTION_NODE:
			return buf.push('<![CDATA[', node.data, ']]>');
		case COMMENT_NODE:
			return buf.push("<!--", node.data, "-->");
		case DOCUMENT_TYPE_NODE:
			var pubid = node.publicId;
			var sysid = node.systemId;
			buf.push('<!DOCTYPE ', node.name);
			if (pubid) {
				buf.push(' PUBLIC "', pubid);
				if (sysid && sysid != '.') {
					buf.push('" "', sysid);
				}
				buf.push('">');
			} else if (sysid && sysid != '.') {
				buf.push(' SYSTEM "', sysid, '">');
			} else {
				var sub = node.internalSubset;
				if (sub) {
					buf.push(" [", sub, "]");
				}
				buf.push(">");
			}
			return;
		case PROCESSING_INSTRUCTION_NODE:
			return buf.push("<?", node.target, " ", node.data, "?>");
		case ENTITY_REFERENCE_NODE:
			return buf.push('&', node.nodeName, ';');

		default:
			buf.push('??', node.nodeName);
	}
}
function _importNode(doc, node, deep) {
	var node2;
	switch (node.nodeType) {
		case ELEMENT_NODE:
			node2 = node.cloneNode(false);
			node2.ownerDocument = doc;

		case DOCUMENT_FRAGMENT_NODE:
			break;
		case ATTRIBUTE_NODE:
			deep = true;
			break;
	}
	if (!node2) {
		node2 = node.cloneNode(false);
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if (deep) {
		var child = node.firstChild;
		while (child) {
			node2.appendChild(_importNode(doc, child, deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function _cloneNode(doc, node, deep) {
	var node2 = new node.constructor();
	for (var n in node) {
		var v = node[n];
		if ((typeof v === 'undefined' ? 'undefined' : _typeof(v)) != 'object') {
			if (v != node2[n]) {
				node2[n] = v;
			}
		}
	}
	if (node.childNodes) {
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
		case ELEMENT_NODE:
			var attrs = node.attributes;
			var attrs2 = node2.attributes = new NamedNodeMap();
			var len = attrs.length;
			attrs2._ownerElement = node2;
			for (var i = 0; i < len; i++) {
				node2.setAttributeNode(_cloneNode(doc, attrs.item(i), true));
			}
			break;;
		case ATTRIBUTE_NODE:
			deep = true;
	}
	if (deep) {
		var child = node.firstChild;
		while (child) {
			node2.appendChild(_cloneNode(doc, child, deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object, key, value) {
	object[key] = value;
}

try {
	if (Object.defineProperty) {
		var getTextContent = function getTextContent(node) {
			switch (node.nodeType) {
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					var buf = [];
					node = node.firstChild;
					while (node) {
						if (node.nodeType !== 7 && node.nodeType !== 8) {
							buf.push(getTextContent(node));
						}
						node = node.nextSibling;
					}
					return buf.join('');
				default:
					return node.nodeValue;
			}
		};

		Object.defineProperty(LiveNodeList.prototype, 'length', {
			get: function get$$1() {
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype, 'textContent', {
			get: function get$$1() {
				return getTextContent(this);
			},
			set: function set$$1(data) {
				switch (this.nodeType) {
					case ELEMENT_NODE:
					case DOCUMENT_FRAGMENT_NODE:
						while (this.firstChild) {
							this.removeChild(this.firstChild);
						}
						if (data || String(data)) {
							this.appendChild(this.ownerDocument.createTextNode(data));
						}
						break;
					default:
						this.data = data;
						this.value = data;
						this.nodeValue = data;
				}
			}
		});

		__set__ = function __set__(object, key, value) {
			object['$$' + key] = value;
		};
	}
} catch (e) {}

var DOMImplementation_1 = DOMImplementation;
var XMLSerializer_1 = XMLSerializer$1;


var dom = {
	DOMImplementation: DOMImplementation_1,
	XMLSerializer: XMLSerializer_1
};

var domParser = createCommonjsModule(function (module, exports) {
	function DOMParser(options) {
		this.options = options || { locator: {} };
	}
	DOMParser.prototype.parseFromString = function (source, mimeType) {
		var options = this.options;
		var sax$$1 = new XMLReader();
		var domBuilder = options.domBuilder || new DOMHandler();
		var errorHandler = options.errorHandler;
		var locator = options.locator;
		var defaultNSMap = options.xmlns || {};
		var entityMap = { 'lt': '<', 'gt': '>', 'amp': '&', 'quot': '"', 'apos': "'" };
		if (locator) {
			domBuilder.setDocumentLocator(locator);
		}

		sax$$1.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
		sax$$1.domBuilder = options.domBuilder || domBuilder;
		if (/\/x?html?$/.test(mimeType)) {
			entityMap.nbsp = '\xa0';
			entityMap.copy = '\xa9';
			defaultNSMap[''] = 'http://www.w3.org/1999/xhtml';
		}
		defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
		if (source) {
			sax$$1.parse(source, defaultNSMap, entityMap);
		} else {
			sax$$1.errorHandler.error("invalid doc source");
		}
		return domBuilder.doc;
	};
	function buildErrorHandler(errorImpl, domBuilder, locator) {
		if (!errorImpl) {
			if (domBuilder instanceof DOMHandler) {
				return domBuilder;
			}
			errorImpl = domBuilder;
		}
		var errorHandler = {};
		var isCallback = errorImpl instanceof Function;
		locator = locator || {};
		function build(key) {
			var fn = errorImpl[key];
			if (!fn && isCallback) {
				fn = errorImpl.length == 2 ? function (msg) {
					errorImpl(key, msg);
				} : errorImpl;
			}
			errorHandler[key] = fn && function (msg) {
				fn('[xmldom ' + key + ']\t' + msg + _locator(locator));
			} || function () {};
		}
		build('warning');
		build('error');
		build('fatalError');
		return errorHandler;
	}

	function DOMHandler() {
		this.cdata = false;
	}
	function position(locator, node) {
		node.lineNumber = locator.lineNumber;
		node.columnNumber = locator.columnNumber;
	}

	DOMHandler.prototype = {
		startDocument: function startDocument() {
			this.doc = new DOMImplementation().createDocument(null, null, null);
			if (this.locator) {
				this.doc.documentURI = this.locator.systemId;
			}
		},
		startElement: function startElement(namespaceURI, localName, qName, attrs) {
			var doc = this.doc;
			var el = doc.createElementNS(namespaceURI, qName || localName);
			var len = attrs.length;
			appendElement(this, el);
			this.currentElement = el;

			this.locator && position(this.locator, el);
			for (var i = 0; i < len; i++) {
				var namespaceURI = attrs.getURI(i);
				var value = attrs.getValue(i);
				var qName = attrs.getQName(i);
				var attr = doc.createAttributeNS(namespaceURI, qName);
				this.locator && position(attrs.getLocator(i), attr);
				attr.value = attr.nodeValue = value;
				el.setAttributeNode(attr);
			}
		},
		endElement: function endElement(namespaceURI, localName, qName) {
			var current = this.currentElement;
			var tagName = current.tagName;
			this.currentElement = current.parentNode;
		},
		startPrefixMapping: function startPrefixMapping(prefix, uri) {},
		endPrefixMapping: function endPrefixMapping(prefix) {},
		processingInstruction: function processingInstruction(target, data) {
			var ins = this.doc.createProcessingInstruction(target, data);
			this.locator && position(this.locator, ins);
			appendElement(this, ins);
		},
		ignorableWhitespace: function ignorableWhitespace(ch, start, length) {},
		characters: function characters(chars, start, length) {
			chars = _toString.apply(this, arguments);

			if (chars) {
				if (this.cdata) {
					var charNode = this.doc.createCDATASection(chars);
				} else {
					var charNode = this.doc.createTextNode(chars);
				}
				if (this.currentElement) {
					this.currentElement.appendChild(charNode);
				} else if (/^\s*$/.test(chars)) {
					this.doc.appendChild(charNode);
				}
				this.locator && position(this.locator, charNode);
			}
		},
		skippedEntity: function skippedEntity(name) {},
		endDocument: function endDocument() {
			this.doc.normalize();
		},
		setDocumentLocator: function setDocumentLocator(locator) {
			if (this.locator = locator) {
				locator.lineNumber = 0;
			}
		},

		comment: function comment(chars, start, length) {
			chars = _toString.apply(this, arguments);
			var comm = this.doc.createComment(chars);
			this.locator && position(this.locator, comm);
			appendElement(this, comm);
		},

		startCDATA: function startCDATA() {
			this.cdata = true;
		},
		endCDATA: function endCDATA() {
			this.cdata = false;
		},

		startDTD: function startDTD(name, publicId, systemId) {
			var impl = this.doc.implementation;
			if (impl && impl.createDocumentType) {
				var dt = impl.createDocumentType(name, publicId, systemId);
				this.locator && position(this.locator, dt);
				appendElement(this, dt);
			}
		},

		warning: function warning(error) {
			console.warn('[xmldom warning]\t' + error, _locator(this.locator));
		},
		error: function error(_error) {
			console.error('[xmldom error]\t' + _error, _locator(this.locator));
		},
		fatalError: function fatalError(error) {
			console.error('[xmldom fatalError]\t' + error, _locator(this.locator));
			throw error;
		}
	};
	function _locator(l) {
		if (l) {
			return '\n@' + (l.systemId || '') + '#[line:' + l.lineNumber + ',col:' + l.columnNumber + ']';
		}
	}
	function _toString(chars, start, length) {
		if (typeof chars == 'string') {
			return chars.substr(start, length);
		} else {
			if (chars.length >= start + length || start) {
				return new java.lang.String(chars, start, length) + '';
			}
			return chars;
		}
	}

	"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function (key) {
		DOMHandler.prototype[key] = function () {
			return null;
		};
	});

	function appendElement(hander, node) {
		if (!hander.currentElement) {
			hander.doc.appendChild(node);
		} else {
			hander.currentElement.appendChild(node);
		}
	}
	var XMLReader = sax.XMLReader;
	var DOMImplementation = exports.DOMImplementation = dom.DOMImplementation;
	exports.XMLSerializer = dom.XMLSerializer;
	exports.DOMParser = DOMParser;
});

var togeojson = createCommonjsModule(function (module, exports) {
    var toGeoJSON = function () {
        'use strict';

        var removeSpace = /\s*/g,
            trimSpace = /^\s*|\s*$/g,
            splitSpace = /\s+/;

        function okhash(x) {
            if (!x || !x.length) return 0;
            for (var i = 0, h = 0; i < x.length; i++) {
                h = (h << 5) - h + x.charCodeAt(i) | 0;
            }return h;
        }

        function get$$1(x, y) {
            return x.getElementsByTagName(y);
        }
        function attr(x, y) {
            return x.getAttribute(y);
        }
        function attrf(x, y) {
            return parseFloat(attr(x, y));
        }

        function get1(x, y) {
            var n = get$$1(x, y);return n.length ? n[0] : null;
        }

        function norm(el) {
            if (el.normalize) {
                el.normalize();
            }return el;
        }

        function numarray(x) {
            for (var j = 0, o = []; j < x.length; j++) {
                o[j] = parseFloat(x[j]);
            }
            return o;
        }

        function nodeVal(x) {
            if (x) {
                norm(x);
            }
            return x && x.textContent || '';
        }

        function getMulti(x, ys) {
            var o = {},
                n,
                k;
            for (k = 0; k < ys.length; k++) {
                n = get1(x, ys[k]);
                if (n) o[ys[k]] = nodeVal(n);
            }
            return o;
        }

        function extend(x, y) {
            for (var k in y) {
                x[k] = y[k];
            }
        }

        function coord1(v) {
            return numarray(v.replace(removeSpace, '').split(','));
        }

        function coord(v) {
            var coords = v.replace(trimSpace, '').split(splitSpace),
                o = [];
            for (var i = 0; i < coords.length; i++) {
                o.push(coord1(coords[i]));
            }
            return o;
        }
        function coordPair(x) {
            var ll = [attrf(x, 'lon'), attrf(x, 'lat')],
                ele = get1(x, 'ele'),
                heartRate = get1(x, 'gpxtpx:hr') || get1(x, 'hr'),
                time = get1(x, 'time'),
                e;
            if (ele) {
                e = parseFloat(nodeVal(ele));
                if (!isNaN(e)) {
                    ll.push(e);
                }
            }
            return {
                coordinates: ll,
                time: time ? nodeVal(time) : null,
                heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null
            };
        }

        function fc() {
            return {
                type: 'FeatureCollection',
                features: []
            };
        }

        var serializer;
        if (typeof XMLSerializer !== 'undefined') {
            serializer = new XMLSerializer();
        } else if ('object' === 'object' && (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && !process.browser) {
            serializer = new domParser.XMLSerializer();
        }
        function xml2str(str) {
            if (str.xml !== undefined) return str.xml;
            return serializer.serializeToString(str);
        }

        var t = {
            kml: function kml(doc) {

                var gj = fc(),
                    styleIndex = {},
                    styleByHash = {},
                    styleMapIndex = {},
                    geotypes = ['Polygon', 'LineString', 'Point', 'Track', 'gx:Track'],
                    placemarks = get$$1(doc, 'Placemark'),
                    styles = get$$1(doc, 'Style'),
                    styleMaps = get$$1(doc, 'StyleMap');

                for (var k = 0; k < styles.length; k++) {
                    var hash = okhash(xml2str(styles[k])).toString(16);
                    styleIndex['#' + attr(styles[k], 'id')] = hash;
                    styleByHash[hash] = styles[k];
                }
                for (var l = 0; l < styleMaps.length; l++) {
                    styleIndex['#' + attr(styleMaps[l], 'id')] = okhash(xml2str(styleMaps[l])).toString(16);
                    var pairs = get$$1(styleMaps[l], 'Pair');
                    var pairsMap = {};
                    for (var m = 0; m < pairs.length; m++) {
                        pairsMap[nodeVal(get1(pairs[m], 'key'))] = nodeVal(get1(pairs[m], 'styleUrl'));
                    }
                    styleMapIndex['#' + attr(styleMaps[l], 'id')] = pairsMap;
                }
                for (var j = 0; j < placemarks.length; j++) {
                    gj.features = gj.features.concat(getPlacemark(placemarks[j]));
                }
                function kmlColor(v) {
                    var color, opacity;
                    v = v || '';
                    if (v.substr(0, 1) === '#') {
                        v = v.substr(1);
                    }
                    if (v.length === 6 || v.length === 3) {
                        color = v;
                    }
                    if (v.length === 8) {
                        opacity = parseInt(v.substr(0, 2), 16) / 255;
                        color = '#' + v.substr(6, 2) + v.substr(4, 2) + v.substr(2, 2);
                    }
                    return [color, isNaN(opacity) ? undefined : opacity];
                }
                function gxCoord(v) {
                    return numarray(v.split(' '));
                }
                function gxCoords(root) {
                    var elems = get$$1(root, 'coord', 'gx'),
                        coords = [],
                        times = [];
                    if (elems.length === 0) elems = get$$1(root, 'gx:coord');
                    for (var i = 0; i < elems.length; i++) {
                        coords.push(gxCoord(nodeVal(elems[i])));
                    }var timeElems = get$$1(root, 'when');
                    for (var j = 0; j < timeElems.length; j++) {
                        times.push(nodeVal(timeElems[j]));
                    }return {
                        coords: coords,
                        times: times
                    };
                }
                function getGeometry(root) {
                    var geomNode,
                        geomNodes,
                        i,
                        j,
                        k,
                        geoms = [],
                        coordTimes = [];
                    if (get1(root, 'MultiGeometry')) {
                        return getGeometry(get1(root, 'MultiGeometry'));
                    }
                    if (get1(root, 'MultiTrack')) {
                        return getGeometry(get1(root, 'MultiTrack'));
                    }
                    if (get1(root, 'gx:MultiTrack')) {
                        return getGeometry(get1(root, 'gx:MultiTrack'));
                    }
                    for (i = 0; i < geotypes.length; i++) {
                        geomNodes = get$$1(root, geotypes[i]);
                        if (geomNodes) {
                            for (j = 0; j < geomNodes.length; j++) {
                                geomNode = geomNodes[j];
                                if (geotypes[i] === 'Point') {
                                    geoms.push({
                                        type: 'Point',
                                        coordinates: coord1(nodeVal(get1(geomNode, 'coordinates')))
                                    });
                                } else if (geotypes[i] === 'LineString') {
                                    geoms.push({
                                        type: 'LineString',
                                        coordinates: coord(nodeVal(get1(geomNode, 'coordinates')))
                                    });
                                } else if (geotypes[i] === 'Polygon') {
                                    var rings = get$$1(geomNode, 'LinearRing'),
                                        coords = [];
                                    for (k = 0; k < rings.length; k++) {
                                        coords.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
                                    }
                                    geoms.push({
                                        type: 'Polygon',
                                        coordinates: coords
                                    });
                                } else if (geotypes[i] === 'Track' || geotypes[i] === 'gx:Track') {
                                    var track = gxCoords(geomNode);
                                    geoms.push({
                                        type: 'LineString',
                                        coordinates: track.coords
                                    });
                                    if (track.times.length) coordTimes.push(track.times);
                                }
                            }
                        }
                    }
                    return {
                        geoms: geoms,
                        coordTimes: coordTimes
                    };
                }
                function getPlacemark(root) {
                    var geomsAndTimes = getGeometry(root),
                        i,
                        properties = {},
                        name = nodeVal(get1(root, 'name')),
                        address = nodeVal(get1(root, 'address')),
                        styleUrl = nodeVal(get1(root, 'styleUrl')),
                        description = nodeVal(get1(root, 'description')),
                        timeSpan = get1(root, 'TimeSpan'),
                        timeStamp = get1(root, 'TimeStamp'),
                        extendedData = get1(root, 'ExtendedData'),
                        lineStyle = get1(root, 'LineStyle'),
                        polyStyle = get1(root, 'PolyStyle'),
                        visibility = get1(root, 'visibility');

                    if (!geomsAndTimes.geoms.length) return [];
                    if (name) properties.name = name;
                    if (address) properties.address = address;
                    if (styleUrl) {
                        if (styleUrl[0] !== '#') {
                            styleUrl = '#' + styleUrl;
                        }

                        properties.styleUrl = styleUrl;
                        if (styleIndex[styleUrl]) {
                            properties.styleHash = styleIndex[styleUrl];
                        }
                        if (styleMapIndex[styleUrl]) {
                            properties.styleMapHash = styleMapIndex[styleUrl];
                            properties.styleHash = styleIndex[styleMapIndex[styleUrl].normal];
                        }

                        var style = styleByHash[properties.styleHash];
                        if (style) {
                            if (!lineStyle) lineStyle = get1(style, 'LineStyle');
                            if (!polyStyle) polyStyle = get1(style, 'PolyStyle');
                        }
                    }
                    if (description) properties.description = description;
                    if (timeSpan) {
                        var begin = nodeVal(get1(timeSpan, 'begin'));
                        var end = nodeVal(get1(timeSpan, 'end'));
                        properties.timespan = { begin: begin, end: end };
                    }
                    if (timeStamp) {
                        properties.timestamp = nodeVal(get1(timeStamp, 'when'));
                    }
                    if (lineStyle) {
                        var linestyles = kmlColor(nodeVal(get1(lineStyle, 'color'))),
                            color = linestyles[0],
                            opacity = linestyles[1],
                            width = parseFloat(nodeVal(get1(lineStyle, 'width')));
                        if (color) properties.stroke = color;
                        if (!isNaN(opacity)) properties['stroke-opacity'] = opacity;
                        if (!isNaN(width)) properties['stroke-width'] = width;
                    }
                    if (polyStyle) {
                        var polystyles = kmlColor(nodeVal(get1(polyStyle, 'color'))),
                            pcolor = polystyles[0],
                            popacity = polystyles[1],
                            fill = nodeVal(get1(polyStyle, 'fill')),
                            outline = nodeVal(get1(polyStyle, 'outline'));
                        if (pcolor) properties.fill = pcolor;
                        if (!isNaN(popacity)) properties['fill-opacity'] = popacity;
                        if (fill) properties['fill-opacity'] = fill === '1' ? properties['fill-opacity'] || 1 : 0;
                        if (outline) properties['stroke-opacity'] = outline === '1' ? properties['stroke-opacity'] || 1 : 0;
                    }
                    if (extendedData) {
                        var datas = get$$1(extendedData, 'Data'),
                            simpleDatas = get$$1(extendedData, 'SimpleData');

                        for (i = 0; i < datas.length; i++) {
                            properties[datas[i].getAttribute('name')] = nodeVal(get1(datas[i], 'value'));
                        }
                        for (i = 0; i < simpleDatas.length; i++) {
                            properties[simpleDatas[i].getAttribute('name')] = nodeVal(simpleDatas[i]);
                        }
                    }
                    if (visibility) {
                        properties.visibility = nodeVal(visibility);
                    }
                    if (geomsAndTimes.coordTimes.length) {
                        properties.coordTimes = geomsAndTimes.coordTimes.length === 1 ? geomsAndTimes.coordTimes[0] : geomsAndTimes.coordTimes;
                    }
                    var feature = {
                        type: 'Feature',
                        geometry: geomsAndTimes.geoms.length === 1 ? geomsAndTimes.geoms[0] : {
                            type: 'GeometryCollection',
                            geometries: geomsAndTimes.geoms
                        },
                        properties: properties
                    };
                    if (attr(root, 'id')) feature.id = attr(root, 'id');
                    return [feature];
                }
                return gj;
            },
            gpx: function gpx(doc) {
                var i,
                    tracks = get$$1(doc, 'trk'),
                    routes = get$$1(doc, 'rte'),
                    waypoints = get$$1(doc, 'wpt'),
                    gj = fc(),
                    feature;
                for (i = 0; i < tracks.length; i++) {
                    feature = getTrack(tracks[i]);
                    if (feature) gj.features.push(feature);
                }
                for (i = 0; i < routes.length; i++) {
                    feature = getRoute(routes[i]);
                    if (feature) gj.features.push(feature);
                }
                for (i = 0; i < waypoints.length; i++) {
                    gj.features.push(getPoint(waypoints[i]));
                }
                function getPoints(node, pointname) {
                    var pts = get$$1(node, pointname),
                        line = [],
                        times = [],
                        heartRates = [],
                        l = pts.length;
                    if (l < 2) return {};
                    for (var i = 0; i < l; i++) {
                        var c = coordPair(pts[i]);
                        line.push(c.coordinates);
                        if (c.time) times.push(c.time);
                        if (c.heartRate) heartRates.push(c.heartRate);
                    }
                    return {
                        line: line,
                        times: times,
                        heartRates: heartRates
                    };
                }
                function getTrack(node) {
                    var segments = get$$1(node, 'trkseg'),
                        track = [],
                        times = [],
                        heartRates = [],
                        line;
                    for (var i = 0; i < segments.length; i++) {
                        line = getPoints(segments[i], 'trkpt');
                        if (line) {
                            if (line.line) track.push(line.line);
                            if (line.times && line.times.length) times.push(line.times);
                            if (line.heartRates && line.heartRates.length) heartRates.push(line.heartRates);
                        }
                    }
                    if (track.length === 0) return;
                    var properties = getProperties(node);
                    extend(properties, getLineStyle(get1(node, 'extensions')));
                    if (times.length) properties.coordTimes = track.length === 1 ? times[0] : times;
                    if (heartRates.length) properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
                    return {
                        type: 'Feature',
                        properties: properties,
                        geometry: {
                            type: track.length === 1 ? 'LineString' : 'MultiLineString',
                            coordinates: track.length === 1 ? track[0] : track
                        }
                    };
                }
                function getRoute(node) {
                    var line = getPoints(node, 'rtept');
                    if (!line.line) return;
                    var prop = getProperties(node);
                    extend(prop, getLineStyle(get1(node, 'extensions')));
                    var routeObj = {
                        type: 'Feature',
                        properties: prop,
                        geometry: {
                            type: 'LineString',
                            coordinates: line.line
                        }
                    };
                    return routeObj;
                }
                function getPoint(node) {
                    var prop = getProperties(node);
                    extend(prop, getMulti(node, ['sym']));
                    return {
                        type: 'Feature',
                        properties: prop,
                        geometry: {
                            type: 'Point',
                            coordinates: coordPair(node).coordinates
                        }
                    };
                }
                function getLineStyle(extensions) {
                    var style = {};
                    if (extensions) {
                        var lineStyle = get1(extensions, 'line');
                        if (lineStyle) {
                            var color = nodeVal(get1(lineStyle, 'color')),
                                opacity = parseFloat(nodeVal(get1(lineStyle, 'opacity'))),
                                width = parseFloat(nodeVal(get1(lineStyle, 'width')));
                            if (color) style.stroke = color;
                            if (!isNaN(opacity)) style['stroke-opacity'] = opacity;

                            if (!isNaN(width)) style['stroke-width'] = width * 96 / 25.4;
                        }
                    }
                    return style;
                }
                function getProperties(node) {
                    var prop = getMulti(node, ['name', 'cmt', 'desc', 'type', 'time', 'keywords']),
                        links = get$$1(node, 'link');
                    if (links.length) prop.links = [];
                    for (var i = 0, link; i < links.length; i++) {
                        link = { href: attr(links[i], 'href') };
                        extend(link, getMulti(links[i], ['text', 'type']));
                        prop.links.push(link);
                    }
                    return prop;
                }
                return gj;
            }
        };
        return t;
    }();

    module.exports = toGeoJSON;
});

var osm2geojson = function osm2geojson(osm, metaProperties) {

    var xml = parse(osm),
        usedCoords = {},
        nodeCache = cacheNodes(),
        wayCache = cacheWays();

    return Bounds({
        type: 'FeatureCollection',
        features: [].concat(Ways(wayCache)).concat(Ways(Relations)).concat(Points(nodeCache))
    }, xml);

    function parse(xml) {
        if (typeof xml !== 'string') return xml;
        return new DOMParser().parseFromString(xml, 'text/xml');
    }

    function Bounds(geo, xml) {
        var bounds = getBy(xml, 'bounds');
        if (!bounds.length) return geo;
        geo.bbox = [attrf(bounds[0], 'minlon'), attrf(bounds[0], 'minlat'), attrf(bounds[0], 'maxlon'), attrf(bounds[0], 'maxlat')];
        return geo;
    }

    function setProperties(element) {
        if (!element) return {};

        var props = {},
            tags = element.getElementsByTagName('tag'),
            tags_length = tags.length;

        for (var t = 0; t < tags_length; t++) {
            props[attr(tags[t], 'k')] = isNumber(attr(tags[t], 'v')) ? parseFloat(attr(tags[t], 'v')) : attr(tags[t], 'v');
        }

        if (metaProperties) {
            setIf(element, 'id', props, 'osm_id');
            setIf(element, 'user', props, 'osm_lastEditor');
            setIf(element, 'version', props, 'osm_version', true);
            setIf(element, 'changeset', props, 'osm_lastChangeset', true);
            setIf(element, 'timestamp', props, 'osm_lastEdited');
        }

        return sortObject(props);
    }

    function getFeature(element, type, coordinates) {
        return {
            geometry: {
                type: type,
                coordinates: coordinates || []
            },
            type: 'Feature',
            properties: setProperties(element)
        };
    }

    function cacheNodes() {
        var nodes = getBy(xml, 'node'),
            coords = {};

        for (var n = 0; n < nodes.length; n++) {
            coords[attr(nodes[n], 'id')] = nodes[n];
        }

        return coords;
    }

    function Points(nodeCache) {
        var points = nodeCache,
            features = [];

        for (var node in nodeCache) {
            var tags = getBy(nodeCache[node], 'tag');
            if (!usedCoords[node] || tags.length) features.push(getFeature(nodeCache[node], 'Point', lonLat(nodeCache[node])));
        }

        return features;
    }

    function cacheWays() {
        var ways = getBy(xml, 'way'),
            out = {};

        for (var w = 0; w < ways.length; w++) {
            var feature = {},
                nds = getBy(ways[w], 'nd');

            if (attr(nds[0], 'ref') === attr(nds[nds.length - 1], 'ref')) {
                feature = getFeature(ways[w], 'Polygon', [[]]);
            } else {
                feature = getFeature(ways[w], 'LineString');
            }

            for (var n = 0; n < nds.length; n++) {
                var node = nodeCache[attr(nds[n], 'ref')];
                if (node) {
                    var cords = lonLat(node);
                    usedCoords[attr(nds[n], 'ref')] = true;
                    if (feature.geometry.type === 'Polygon') {
                        feature.geometry.coordinates[0].push(cords);
                    } else {
                        feature.geometry.coordinates.push(cords);
                    }
                }
            }

            out[attr(ways[w], 'id')] = feature;
        }

        return out;
    }

    function Relations() {
        var relations = getBy(xml, 'relation'),
            relations_length = relations.length,
            features = [];

        for (var r = 0; r < relations_length; r++) {
            var feature = getFeature(relations[r], 'MultiPolygon');

            if (feature.properties.type == 'multipolygon') {
                var members = getBy(relations[r], 'member');

                for (var m = 0; m < members.length; m++) {
                    if (attr(members[m], 'role') == 'outer') assignWay(members[m], feature);
                }

                for (var n = 0; n < members.length; n++) {
                    if (attr(members[n], 'role') == 'inner') assignWay(members[n], feature);
                }

                delete feature.properties.type;
            } else {}

            if (feature.geometry.coordinates.length) features.push(feature);
        }

        return features;

        function assignWay(member, feature) {
            var ref = attr(member, 'ref'),
                way = wayCache[ref];

            if (way && way.geometry.type == 'Polygon') {
                if (way && attr(member, 'role') == 'outer') {
                    feature.geometry.coordinates.push(way.geometry.coordinates);
                    if (way.properties) {
                        for (var prop in way.properties) {
                            if (!feature.properties[prop]) {
                                feature.properties[prop] = prop;
                            }
                        }
                    }
                } else if (way && attr(member, 'role') == 'inner') {
                    if (feature.geometry.coordinates.length > 1) {
                        for (var a = 0; a < feature.geometry.coordinates.length; a++) {
                            if (pointInPolygon(way.geometry.coordinates[0][0], feature.geometry.coordinates[a][0])) {
                                feature.geometry.coordinates[a].push(way.geometry.coordinates[0]);
                                break;
                            }
                        }
                    } else {
                        if (feature.geometry.coordinates.length) {
                            feature.geometry.coordinates[0].push(way.geometry.coordinates[0]);
                        }
                    }
                }
            }

            wayCache[ref] = false;
        }
    }

    function Ways(wayCache) {
        var features = [];
        for (var w in wayCache) {
            if (wayCache[w]) features.push(wayCache[w]);
        }return features;
    }

    function pointInPolygon(point, vs) {
        var x = point[0],
            y = point[1];
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1],
                xj = vs[j][0],
                yj = vs[j][1],
                intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function sortObject(o) {
        var sorted = {},
            key,
            a = [];
        for (key in o) {
            if (o.hasOwnProperty(key)) a.push(key);
        }a.sort();
        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }return sorted;
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function attr(x, y) {
        return x.getAttribute(y);
    }
    function attrf(x, y) {
        return parseFloat(x.getAttribute(y));
    }
    function getBy(x, y) {
        return x.getElementsByTagName(y);
    }
    function lonLat(elem) {
        return [attrf(elem, 'lon'), attrf(elem, 'lat')];
    }
    function setIf(x, y, o, name, f) {
        if (attr(x, y)) o[name] = f ? parseFloat(attr(x, y)) : attr(x, y);
    }
};

var formats = {
    geojson: geojsonLoad,
    topojson: topojsonLoad,
    csv: csvLoad,
    gpx: gpxLoad,
    kml: kmlLoad,
    wkt: wktLoad,
    polyline: polylineLoad,
    osm: osmLoad
};

function geojsonLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var json = JSON.parse(response);
        cb(null, json);
    });
    return this;
}

function topojsonLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var json = topojsonParse(response);
        cb(null, json);
    });
    return this;
}

topojsonLoad.parse = topojsonParse;

function csvLoad(url, options, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        if (maptalks.Util.isFunction(options)) {
            cb = options;
            options = {};
        }
        csvParse(response, options, function (err, geojson) {
            if (err) {
                cb(err);
                return;
            }
            cb(null, geojson);
        });
    });
    return this;
}

csvLoad.parse = csvParse;

function gpxLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var geojson = gpxParse(response);
        cb(null, geojson);
    });
    return this;
}

gpxLoad.parse = gpxParse;

function kmlLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var geojson = kmlParse(response);
        cb(null, geojson);
    });
    return this;
}

kmlLoad.parse = kmlParse;

function wktLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var geojson = wktParse(response);
        cb(null, geojson);
    });
    return this;
}

wktLoad.parse = wktParse;

function osmLoad(url, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        var geojson = osm2geojson(response);
        cb(null, geojson);
    });
    return this;
}

function polylineLoad(url, options, cb) {
    maptalks.Ajax.get(url, function (err, response) {
        if (err) {
            cb(err);
            return;
        }
        if (maptalks.Util.isFunction(options)) {
            cb = options;
            options = {};
        }
        var geojson = polylineParse(response, options);
        cb(null, geojson);
    });
    return this;
}

polylineLoad.parse = polylineParse;

function topojsonParse(data) {
    var json = [];
    var o = typeof data === 'string' ? JSON.parse(data) : data;
    for (var i in o.objects) {
        var ft = topoFeature(o, o.objects[i]);
        if (ft.features) {
            maptalks.Util.pushIn(json, ft.features);
        } else {
            json.push(ft);
        }
    }
    return json;
}

function csvParse(csv, options, cb) {
    index.csv2geojson(csv, options || {}, function (err, geojson) {
        return cb(err, geojson);
    });
}

function gpxParse(gpx) {
    var xml = parseXML(gpx);
    if (!xml) {
        throw new Error('Could not parse gpx');
    }
    var geojson = togeojson.gpx(xml);
    return geojson;
}

function kmlParse(kml) {
    var xml = parseXML(kml);
    if (!xml) {
        throw new Error('Could not parse KML');
    }
    var geojson = togeojson.kml(xml);
    return geojson;
}

function wktParse(wkt) {
    return index$4(wkt);
}

function polylineParse(txt, options) {
    options = options || {};
    var coords = polyline_1.decode(txt, options.precision);
    var geojson = { type: 'LineString', coordinates: [] };
    for (var i = 0; i < coords.length; i++) {
        geojson.coordinates[i] = [coords[i][1], coords[i][0]];
    }
    return geojson;
}

function parseXML(str) {
    if (typeof str === 'string') {
        return new DOMParser().parseFromString(str, 'text/xml');
    } else {
        return str;
    }
}

exports.Formats = formats;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.formats v0.3.0, requires maptalks@^0.25.0.');

})));
