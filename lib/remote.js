'use strict';
/**
 * this is going to query the git package for the latest version and compare with our local
 * we will only check it once a day
 */
var http = require('http');

// https://raw.githubusercontent.com/joelchu/generator-ng-panes/master/package.json
