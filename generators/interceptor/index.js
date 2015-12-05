'use strict';
/**
 * interceptor sub generator
 */

var util = require('util');
var path = require('path');
var fs   = require('fs');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);

/**
 * generate the service file
 */
Generator.prototype.createSkeletonFile = function()
{

    var app_js_file = path.join('app','scripts','app.js');
    var appJsFile = fs.readFileSync(app_js_file, 'utf-8');
    var pattern = new RegExp(/(\.config\(\[)(.*)(\{)/gi);
    var matches = appJsFile.match(pattern);
    if (matches) {
        // get the interceptor template
        var interceptor_file = path.join(this.baseSourceRoot , 'service' , 'interceptor.js');
        var interceptorJs = fs.readFileSync(interceptor_file , 'utf-8');

        console.log(matches);

    }
};