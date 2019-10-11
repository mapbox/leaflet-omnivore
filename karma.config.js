const pkg = require('./package.json');

module.exports = {
    basePath : '.',
    frameworks: ['mocha', 'expect', 'expect-maptalks', 'happen'],
    files: [
        'node_modules/maptalks/dist/maptalks.js',
        'dist/' + pkg.name + '.js',
        'test/**/*.js',
        {
            pattern: 'test/a.*',
            included: false
        },
        {
            pattern: 'test/options.csv',
            included: false
        },
        {
            pattern: 'test/osm.osm',
            included: false
        }
    ],

    preprocessors: {
    },
    browsers: ['Chrome'],
    reporters: ['mocha'],
    customLaunchers: {
        IE10: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE10'
        },
        IE9: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE9'
        }
    },
    singleRun : true
};
