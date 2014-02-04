all: leaflet-omnivore.js test/bundle.js

leaflet-omnivore.js: index.js
	./node_modules/.bin/browserify -s omnivore index.js > leaflet-omnivore.js

test/bundle.js: test/test.js index.js
	./node_modules/.bin/browserify test/test.js > test/bundle.js
