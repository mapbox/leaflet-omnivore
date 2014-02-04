var xhr = require('corslite'),
    csv2geojson = require('csv2geojson'),
    toGeoJSON = require('togeojson');

module.exports.geojson = geojsonLoad;

module.exports.csv = csvLoad;
module.exports.csv.parse = csvParse;

module.exports.gpx = gpxLoad;
module.exports.gpx.parse = gpxParse;

module.exports.kml = kmlLoad;
module.exports.kml.parse = kmlParse;

function geojsonLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, function(err, response) {
        if (err) return;
        layer.addData(JSON.parse(response.responseText));
    });
    return layer;
}

function csvLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, function(err, response) {
        if (err) return;
        csvParse(response.responseText, options, layer);
    });
    return layer;
}

function csvParse(csv, options, layer) {
    layer = layer || L.geoJson();
    csv2geojson.csv2geojson(csv, function(err, geojson) {
        if (err) return;
        layer.addData(geojson);
    });
    return layer;
}

function gpxLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, function(err, response) {
        if (err) return;
        var xml = getXML(response);
        if (!xml) return;
        gpxParse(xml, options, layer);
    });
    return layer;
}

function gpxParse(gpx, options, layer) {
    layer = layer || L.geoJson();
    var geojson = toGeoJSON.gpx(gpx);
    layer.addData(geojson);
    return layer;
}

function kmlLoad(url, options) {
    var layer = L.geoJson();
    xhr(url, function(err, response) {
        if (err) return;
        var xml = getXML(response);
        if (!xml) return;
        kmlParse(xml, options, layer);
    });
    return layer;
}

function kmlParse(gpx, options, layer) {
    layer = layer || L.geoJson();
    var geojson = toGeoJSON.kml(gpx);
    layer.addData(geojson);
    return layer;
}

function getXML(response) {
    try {
        return response.responseXML || (new DOMParser()).parseFromString(response.responseText, 'text/xml');
    } catch(e) {
        return null;
    }
}
