require('maptalks');
require('../');

var test = require('tape'),
    fs = require('fs');

var uid = 0;

test('gpx-featureLayer', function (t) {
    function customFilter() { return true; }
    var l = new maptalks.GeoJSONLayer(uid++);
    var layer = maptalks.Formats.gpx('a.gpx', null, l);

    layer.on('ready', function() {
        t.pass('fires ready event');
        t.end();
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
        t.end();
    });
});

test('gpx-customLayer', function (t) {
    function customFilter() { return true; }
    var l = new maptalks.GeoJSONLayer(uid++);
    var layer = maptalks.Formats.gpx('a.gpx', null, l);
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
        t.end();
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
        t.end();
    });
});

test('gpx', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.gpx('a.gpx');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('polyline.parse', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.polyline.parse(fs.readFileSync('./test/a.polyline', 'utf8'));
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    t.equal(layer.getGeometries().length, 1);
});

test('gpx.parse', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.gpx.parse(fs.readFileSync('./test/a.gpx', 'utf8'));
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    t.equal(layer.getGeometries().length, 1);
});

test('csv fail', function (t) {
    t.plan(4);
    var layer = maptalks.Formats.csv('a.gpx');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.fail('fires ready event');
    });
    layer.on('error', function(e) {
        t.equal(e.error.message, 'Latitude and longitude fields not present');
        t.equal(e.error.type, 'Error');
        t.pass('fires error event');
    });
});

test('csv options', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.csv('options.csv', {
        latfield: 'a',
        lonfield: 'b'
    });
    layer.on('ready', function() {
        t.pass('fires ready event');
        t.deepEqual(
            layer.getGeometries()[0].getCoordinates().toArray(),
            [10, 20], 'parses coordinates');
    });
    layer.on('error', function() {
        t.fail('fires error event');
    });
});

test('kml', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.kml('a.kml');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('kml.parse', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.kml.parse(fs.readFileSync('./test/a.kml', 'utf8'));
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    t.equal(layer.getGeometries().length, 2);
});

test('csv', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.csv('a.csv');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('polyline', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.polyline('a.polyline');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('csv.parse', function (t) {
    t.plan(1);
    var lyr = maptalks.Formats.csv.parse('lat,lon,title\n0,0,"Hello"');
    t.ok(lyr instanceof maptalks.GeoJSONLayer, 'produces layer');
});

test('wkt.parse', function (t) {
    t.plan(1);
    var lyr = maptalks.Formats.wkt.parse('MultiPoint(20 20, 10 10, 30 30)');
    t.ok(lyr instanceof maptalks.GeoJSONLayer, 'produces layer');
});

test('wkt', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.wkt('a.wkt');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('topojson', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.topojson('a.topojson');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('topojson.parse', function (t) {
    t.plan(1);
    var lyr = maptalks.Formats.topojson.parse(fs.readFileSync('./test/a.topojson', 'utf8'));
    t.ok(lyr instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
});

test('geojson', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.geojson('a.geojson');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.pass('fires ready event');
    });
    layer.on('error', function() {
        t.fail('does not fire error event');
    });
});

test('geojson: fail', function (t) {
    t.plan(2);
    var layer = maptalks.Formats.geojson('404 does not exist');
    t.ok(layer instanceof maptalks.GeoJSONLayer, 'produces geojson layer');
    layer.on('ready', function() {
        t.fail('fires ready event');
    });
    layer.on('error', function(e) {
        t.pass('fires error event');
    });
});
