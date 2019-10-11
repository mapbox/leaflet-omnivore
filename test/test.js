describe('maptalks.formats', function () {

    it('gpx', function (done) {
        maptalks.Formats.gpx('/base/test/a.gpx', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('csv fail', function (done) {
        maptalks.Formats.csv('/base/test/a.gpx', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('csv options', function (done) {
        maptalks.Formats.csv('/base/test/options.csv', {
            latfield: 'a',
            lonfield: 'b'
        }, function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('kml', function (done) {
        maptalks.Formats.kml('/base/test/a.kml', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });


    it('csv', function (done) {
        maptalks.Formats.csv('/base/test/a.csv', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('polyline', function (done) {
        maptalks.Formats.polyline('/base/test/a.polyline', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('csv.parse', function (done) {
        maptalks.Formats.csv.parse('lat,lon,title\n0,0,"Hello"', null, function (err, geojson) {
            if (err) {
                throw err;
            }
            expect(geojson).to.be.ok();
            done();
        });
    });

    it('wkt.parse', function () {
        var geojson = maptalks.Formats.wkt.parse('MultiPoint(20 20, 10 10, 30 30)');
        expect(geojson).to.be.ok();
    });

    it('wkt', function (done) {
        maptalks.Formats.wkt('/base/test/a.wkt', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('topojson', function (done) {
        maptalks.Formats.topojson('/base/test/a.topojson', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('geojson', function (done) {
        maptalks.Formats.geojson('/base/test/a.geojson', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data).to.be.ok();
            done();
        });
    });

    it('osm', function (done) {
        maptalks.Formats.osm('/base/test/osm.osm', function (err, data) {
            if (err) {
                throw err;
            }
            expect(data.features.length).to.be.ok();
            done();
        });
    });
});
