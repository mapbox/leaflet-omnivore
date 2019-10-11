import * as maptalks from 'maptalks';
import csv2geojson from 'csv2geojson';
import wellknown from 'wellknown';
import polyline from '@mapbox/polyline';
import { feature as topoFeature } from 'topojson';
import toGeoJSON from '@mapbox/togeojson';
import { osm2geojson } from './src/osm2geojson';

const formats = {
    geojson: geojsonLoad,
    topojson: topojsonLoad,
    csv: csvLoad,
    gpx: gpxLoad,
    kml: kmlLoad,
    wkt: wktLoad,
    polyline: polylineLoad,
    osm: osmLoad
};

export { formats as Formats };

function geojsonLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const json = JSON.parse(response);
        cb(null, json);
    });
    return this;
}

/**
 * Load a [TopoJSON](https://github.com/mbostock/topojson) document.
 *
 * @param {string} url
 * @param {function} callback
 * @returns this
 */
function topojsonLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const json = topojsonParse(response);
        cb(null, json);
    });
    return this;
}

topojsonLoad.parse = topojsonParse;

/**
 * Load a CSV document into a layer and return the layer.
 *
 * @param {string} url
 * @param {object} options
 * @param {function} callback
 * @returns this
 */
function csvLoad(url, options, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        if (maptalks.Util.isFunction(options)) {
            cb = options;
            options = {};
        }
        csvParse(response, options, (err, geojson) => {
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

/**
 * Load a GPX document.
 *
 * @param {string} url
 * @param {function} callback
 * @returns this
 */
function gpxLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const geojson = gpxParse(response);
        cb(null, geojson);
    });
    return this;
}

gpxLoad.parse = gpxParse;

/**
 * Load a [KML](https://developers.google.com/kml/documentation/) document.
 *
 * @param {string} url
 * @param {function} callback
 * @returns this
 */
function kmlLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const geojson = kmlParse(response);
        cb(null, geojson);
    });
    return this;
}

kmlLoad.parse = kmlParse;

/**
 * Load a WKT (Well Known Text) string
 *
 * @param {string} url
 * @param {object} customLayer
 * @returns {object}
 */
function wktLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const geojson = wktParse(response);
        cb(null, geojson);
    });
    return this;
}

wktLoad.parse = wktParse;



function osmLoad(url, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        const geojson = osm2geojson(response);
        cb(null, geojson);
    });
    return this;
}

/**
 * Load a polyline string into a layer and return the layer
 *
 * @param {string} url
 * @param {object} options
 * @param {function} callback
 * @returns {object}
 */
function polylineLoad(url, options, cb) {
    maptalks.Ajax.get(url, (err, response) => {
        if (err) {
            cb(err);
            return;
        }
        if (maptalks.Util.isFunction(options)) {
            cb = options;
            options = {};
        }
        const geojson = polylineParse(response, options);
        cb(null, geojson);
    });
    return this;
}

polylineLoad.parse = polylineParse;

function topojsonParse(data) {
    const json = [];
    const o = typeof data === 'string' ?
        JSON.parse(data) : data;
    for (const i in o.objects) {
        const ft = topoFeature(o, o.objects[i]);
        if (ft.features) {
            maptalks.Util.pushIn(json, ft.features);
        } else {
            json.push(ft);
        }
    }
    return json;
}


function csvParse(csv, options, cb) {
    csv2geojson.csv2geojson(csv, options || {}, (err, geojson) => cb(err, geojson));
}

function gpxParse(gpx) {
    const xml = parseXML(gpx);
    if (!xml) {
        throw new Error('Could not parse gpx');
    }
    const geojson = toGeoJSON.gpx(xml);
    return geojson;
}

function kmlParse(kml) {
    const xml = parseXML(kml);
    if (!xml) {
        throw new Error('Could not parse KML');
    }
    const geojson = toGeoJSON.kml(xml);
    return geojson;
}

function wktParse(wkt) {
    return wellknown(wkt);
}

function polylineParse(txt, options) {
    options = options || {};
    const coords = polyline.decode(txt, options.precision);
    const geojson = { type: 'LineString', coordinates: [] };
    for (let i = 0; i < coords.length; i++) {
        // polyline returns coords in lat, lng order, so flip for geojson
        geojson.coordinates[i] = [coords[i][1], coords[i][0]];
    }
    return geojson;
}

function parseXML(str) {
    if (typeof str === 'string') {
        return (new DOMParser()).parseFromString(str, 'text/xml');
    } else {
        return str;
    }
}
