var xhr = require('corslite'),
    csv2geojson = require('csv2geojson'),
    wellknown = require('wellknown'),
    topojson = require('topojson'),
    toGeoJSON = require('togeojson');

module.exports.geojson = geojsonLoad;

module.exports.topojson = topojsonLoad;
module.exports.topojson.parse = topojsonParse;

module.exports.csv = csvLoad;
module.exports.csv.parse = csvParse;

module.exports.gpx = gpxLoad;
module.exports.gpx.parse = gpxParse;

module.exports.kml = kmlLoad;
module.exports.kml.parse = kmlParse;

module.exports.wkt = wktLoad;
module.exports.wkt.parse = wktParse;

function geojsonLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, function(err, response) {
        if (err) return layer.fire('error', { error: err });
        layer.addData(JSON.parse(response.responseText));
        layer.fire('ready');
    });
    return layer;
}

function topojsonLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, onload);
    function onload(err, response) {
        if (err) return layer.fire('error', { error: err });
        layer.addData(topojsonParse(response.responseText));
        layer.fire('ready');
    }
    return layer;
}

function topojsonParse(data) {
    var o = typeof data === 'string' ?
        JSON.parse(data) : data;
    var features = [];
    for (var i in o.objects) {
        var ft = topojson.feature(o, o.objects[i]);
        if (ft.features) features = features.concat(ft.features);
        else features = features.concat([ft]);
    }
    return features;
}

function csvLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, onload);
    function onload(err, response) {
        var error;
        if (err) return layer.fire('error', { error: err });
        function avoidReady() {
            error = true;
        }
        layer.on('error', avoidReady);
        csvParse(response.responseText, options, layer);
        layer.off('error', avoidReady);
        if (!error) layer.fire('ready');
    }
    return layer;
}

function csvParse(csv, options, layer) {
    layer = layer || L.geoJson();
    options = options || {};
    csv2geojson.csv2geojson(csv, options, onparse);
    function onparse(err, geojson) {
        if (err) return layer.fire('error', { error: err });
        layer.addData(geojson);
    }
    return layer;
}

function gpxLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, onload);
    function onload(err, response) {
        var error;
        if (err) return layer.fire('error', { error: err });
        function avoidReady() {
            error = true;
        }
        layer.on('error', avoidReady);
        gpxParse(response.responseXML || response.responseText, options, layer);
        layer.off('error', avoidReady);
        if (!error) layer.fire('ready');
    }
    return layer;
}

function gpxParse(gpx, options, layer) {
    var xml = parseXML(gpx);
    if (!xml) return layer.fire('error', {
        error: 'Could not parse GPX'
    });
    layer = layer || L.geoJson();
    var geojson = toGeoJSON.gpx(xml);
    layer.addData(geojson);
    return layer;
}

function kmlLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, onload);
    function onload(err, response) {
        var error;
        if (err) return layer.fire('error', { error: err });
        function avoidReady() {
            error = true;
        }
        layer.on('error', avoidReady);
        kmlParse(response.responseXML || response.responseText, options, layer);
        layer.off('error', avoidReady);
        if (!error) layer.fire('ready');
    }
    return layer;
}

function kmlParse(gpx, options, layer) {
    var xml = parseXML(gpx);
    if (!xml) return layer.fire('error', {
        error: 'Could not parse GPX'
    });
    layer = layer || L.geoJson();
    var geojson = toGeoJSON.kml(xml);
    layer.addData(geojson);
    return layer;
}

function wktLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, onload);
    function onload(err, response) {
        if (err) return layer.fire('error', { error: err });
        wktParse(response.responseText, options, layer);
        layer.fire('ready');
    }
    return layer;
}

function wktParse(wkt, options, layer) {
    layer = layer || L.geoJson();
    var geojson = wellknown(wkt);
    layer.addData(geojson);
    return layer;
}

function parseXML(str) {
    if (typeof str === 'string') {
        return (new DOMParser()).parseFromString(str, 'text/xml');
    } else {
        return str;
    }
}
