#!/bin/bash

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.Here.js >dist/lrm-here.js
uglifyjs dist/lrm-here.js >dist/lrm-here.min.js
echo Done.
