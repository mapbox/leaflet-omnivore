

/*
copy from https://github.com/aaronlidman/osm-and-geojson

not support ES Module


*/


export const geojson2osm = function (geo, changeset, osmChange) {
    function togeojson(geo, properties) {
        var nodes = '',
            ways = '',
            relations = '';
        properties = properties || {};

        switch (geo.type) {
            case 'Point':
                var coord = roundCoords([geo.coordinates]);
                nodes += '<node id="' + count + '" lat="' + coord[0][1] +
                    '" lon="' + coord[0][0] + '" changeset="' + changeset + '">';
                nodes += propertiesToTags(properties);
                nodes += '</node>';
                count--;
                break;

            case 'MultiPoint':
                break;
            case 'LineString':
                break;
            case 'MultiLineString':
                break;
            case 'Polygon':
                append(polygon(geo, properties));
                break;

            case 'MultiPolygon':
                relations += '<relation id="' + count + '" changeset="' + changeset + '">';
                properties.type = 'multipolygon';
                count--;

                for (var i = 0; i < geo.coordinates.length; i++) {

                    poly = polygon({
                        'coordinates': geo.coordinates[i]
                    }, undefined, true);

                    nodes += poly.nodes;
                    ways += poly.ways;
                    relations += poly.relations;
                }

                relations += propertiesToTags(properties);
                relations += '</relation>';
                break;
        }

        function append(obj) {
            nodes += obj.nodes;
            ways += obj.ways;
            relations += obj.relations;
        }

        osm = '<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="github.com/aaronlidman/osm-and-geojson">' +
            nodes + ways + relations + '</osm>';
        if (osmChange) {
            osm = '<osmChange version="0.6" generator="github.com/aaronlidman/osm-and-geojson"><create>' +
                nodes + ways + relations + '</create></osmChange>';
        }

        return {
            nodes: nodes,
            ways: ways,
            relations: relations,
            osm: osm
        };
    }

    function polygon(geo, properties, multipolygon) {
        var nodes = '',
            ways = '',
            relations = '',
            role = '';
        properties = properties || {};
        multipolygon = multipolygon || false;

        var coords = [];
        if (geo.coordinates.length > 1) {
            // polygon with holes -> multipolygon
            if (!multipolygon) relations += '<relation id="' + count + '" changeset="' + changeset + '">';
            count--;
            properties.type = 'multipolygon';

            for (var i = 0; i < geo.coordinates.length; i++) {

                role = ((i === 0) ? 'outer' : 'inner');

                relations += '<member type="way" ref="' + count + '" role="' + role + '"/>';
                ways += '<way id="' + count + '" changeset="' + changeset + '">';
                count--;
                for (var a = 0; a < geo.coordinates[i].length - 1; a++) {
                    coords.push([geo.coordinates[i][a][1], geo.coordinates[i][a][0]]);
                }
                coords = createNodes(coords, true);
                nodes += coords.nodes;
                ways += coords.nds;
                ways += '</way>';
                coords = [];
            }

            if (!multipolygon) {
                relations += propertiesToTags(properties);
                relations += '</relation>';
            }
        } else {
            // polygon -> way
            ways += '<way id="' + count + '" changeset="' + changeset + '">';
            if (multipolygon) relations += '<member type="way" ref="' + count + '" role="outer"/>';
            count--;
            for (var j = 0; j < geo.coordinates[0].length - 1; j++) {
                coords.push([geo.coordinates[0][j][1], geo.coordinates[0][j][0]]);
            }
            coords = createNodes(coords, true);
            nodes += coords.nodes;
            ways += coords.nds;
            ways += propertiesToTags(properties);
            ways += '</way>';
        }

        return {
            nodes: nodes,
            ways: ways,
            relations: relations
        };
    }

    function propertiesToTags(properties) {
        var tags = '';
        for (var tag in properties) {
            if (properties[tag] !== null) {
                tags += '<tag k="' + tag + '" v="' + properties[tag] + '"/>';
            }
        }
        return tags;
    }

    function roundCoords(coords) {
        for (var a = 0; a < coords.length; a++) {
            coords[a][0] = Math.round(coords[a][0] * 1000000) / 1000000;
            coords[a][1] = Math.round(coords[a][1] * 1000000) / 1000000;
        }
        return coords;
    }

    function createNodes(coords, repeatLastND) {
        var nds = '',
            nodes = '',
            length = coords.length;
        repeatLastND = repeatLastND || false;
        // for polygons

        coords = roundCoords(coords);

        for (var a = 0; a < length; a++) {
            if (repeatLastND && a === 0) repeatLastND = count;

            nds += '<nd ref="' + count + '"/>';
            nodes += '<node id="' + count + '" lat="' + coords[a][0] + '" lon="' + coords[a][1] +
                '" changeset="' + changeset + '"/>';

            if (repeatLastND && a === length - 1) nds += '<nd ref="' + repeatLastND + '"/>';
            count--;
        }
        return { 'nds': nds, 'nodes': nodes };
    }

    if (typeof geo === 'string') geo = JSON.parse(geo);

    var obj,
        count = -1;
    changeset = changeset || false;

    switch (geo.type) {
        case 'FeatureCollection':
            var temp = {
                nodes: '',
                ways: '',
                relations: ''
            };
            obj = [];
            for (var i = 0; i < geo.features.length; i++) {
                obj.push(togeojson(geo.features[i].geometry, geo.features[i].properties));
            }
            temp.osm = '<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="github.com/aaronlidman/osm-and-geojson">';
            if (osmChange) temp.osm = '<osmChange version="0.6" generator="github.com/aaronlidman/osm-and-geojson"><create>';
            for (var n = 0; n < obj.length; n++) {
                temp.nodes += obj[n].nodes;
                temp.ways += obj[n].ways;
                temp.relations += obj[n].relations;
            }
            temp.osm += temp.nodes + temp.ways + temp.relations;
            if (osmChange) {
                temp.osm += '</create></osmChange>';
            } else {
                temp.osm += '</osm>';
            }
            obj = temp.osm;
            break;

        case 'GeometryCollection':
            obj = [];
            for (var j = 0; j < geo.geometries.length; j++) {
                obj.push(togeojson(geo.geometries[j]));
            }
            break;

        case 'Feature':
            obj = togeojson(geo.geometry, geo.properties);
            obj = obj.osm;
            break;

        case 'Point':
        case 'MultiPoint':
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
            obj = togeojson(geo);
            obj = obj.osm;
            break;

        default:
            if (console) console.log('Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\", ' +
                '\"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".');
    }

    return obj;
};

export const osm2geojson = function (osm, metaProperties) {

    var xml = parse(osm),
        usedCoords = {},
        nodeCache = cacheNodes(),
        wayCache = cacheWays();

    return Bounds({
        type: 'FeatureCollection',
        features: []
            .concat(Ways(wayCache))
            .concat(Ways(Relations))
            .concat(Points(nodeCache))
    }, xml);

    function parse(xml) {
        if (typeof xml !== 'string') return xml;
        return (new DOMParser()).parseFromString(xml, 'text/xml');
    }

    function Bounds(geo, xml) {
        var bounds = getBy(xml, 'bounds');
        if (!bounds.length) return geo;
        geo.bbox = [
            attrf(bounds[0], 'minlon'),
            attrf(bounds[0], 'minlat'),
            attrf(bounds[0], 'maxlon'),
            attrf(bounds[0], 'maxlat')
        ];
        return geo;
    }

    function setProperties(element) {
        if (!element) return {};

        var props = {},
            tags = element.getElementsByTagName('tag'),
            tags_length = tags.length;

        for (var t = 0; t < tags_length; t++) {
            props[attr(tags[t], 'k')] = isNumber(attr(tags[t], 'v')) ?
                parseFloat(attr(tags[t], 'v')) : attr(tags[t], 'v');
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
            if (!usedCoords[node] || tags.length)
                features.push(getFeature(nodeCache[node], 'Point', lonLat(nodeCache[node])));
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

                // osm doesn't keep roles in order, so we do this twice
                for (var m = 0; m < members.length; m++) {
                    if (attr(members[m], 'role') == 'outer') assignWay(members[m], feature);
                }

                for (var n = 0; n < members.length; n++) {
                    if (attr(members[n], 'role') == 'inner') assignWay(members[n], feature);
                }

                delete feature.properties.type;
            } else {
                // http://taginfo.openstreetmap.us/relations
            }

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
                        // exterior polygon properties can move to the multipolygon
                        // but multipolygon (relation) tags take precedence
                        for (var prop in way.properties) {
                            if (!feature.properties[prop]) {
                                feature.properties[prop] = prop;
                            }
                        }
                    }
                } else if (way && attr(member, 'role') == 'inner') {
                    if (feature.geometry.coordinates.length > 1) {
                        // do a point in polygon against each outer
                        // this determines which outer the inner goes with
                        for (var a = 0; a < feature.geometry.coordinates.length; a++) {
                            if (pointInPolygon(
                                way.geometry.coordinates[0][0],
                                feature.geometry.coordinates[a][0])) {
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
        for (var w in wayCache) if (wayCache[w]) features.push(wayCache[w]);
        return features;
    }

    // https://github.com/substack/point-in-polygon/blob/master/index.js
    function pointInPolygon(point, vs) {
        var x = point[0], y = point[1];
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1],
                xj = vs[j][0], yj = vs[j][1],
                intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // http://stackoverflow.com/a/1359808
    function sortObject(o) {
        var sorted = {}, key, a = [];
        for (key in o) if (o.hasOwnProperty(key)) a.push(key);
        a.sort();
        for (key = 0; key < a.length; key++) sorted[a[key]] = o[a[key]];
        return sorted;
    }

    // http://stackoverflow.com/a/1830844
    function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
    function attr(x, y) { return x.getAttribute(y); }
    function attrf(x, y) { return parseFloat(x.getAttribute(y)); }
    function getBy(x, y) { return x.getElementsByTagName(y); }
    function lonLat(elem) { return [attrf(elem, 'lon'), attrf(elem, 'lat')]; }
    function setIf(x, y, o, name, f) {
        if (attr(x, y)) o[name] = f ? parseFloat(attr(x, y)) : attr(x, y);
    }
};