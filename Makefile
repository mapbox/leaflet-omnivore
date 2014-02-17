all: leaflet-omnivore.min.js test/bundle.js

leaflet-omnivore.min.js: leaflet-omnivore.js
	./node_modules/.bin/uglifyjs leaflet-omnivore.js > leaflet-omnivore.min.js

leaflet-omnivore.js: index.js
	./node_modules/.bin/browserify -s omnivore index.js > leaflet-omnivore.js

test/bundle.js: test/test.js index.js
	./node_modules/.bin/browserify -t brfs test/test.js -d > test/bundle.js
