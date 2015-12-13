'use strict';
/**
 * This will create the module structure
 */
var util = require('util');
var path = require('path');
var fs   = require('fs');
var chalk = require('chalk');
var _ = require('underscore');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');

var us = require('underscore.string');

var Generator = module.exports = function()
{
     ScriptBase.apply(this, arguments);

     this.config = preference.getConfig();
};

util.inherits(Generator, ScriptBase);

/**
 * this will run in full interactive mode
 * 1. the package name will be the module name? or allow to change?
 * 2. append the _build_release.js to the gulpfile.js
 * 3. module to include in the package, and setup the files structure 
 */
Generator.prototype.startQuestion = function()
{

};
