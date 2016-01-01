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
 * make this very simple, just generate the extra gulpfile
 * update the package.json and tell the user to customize it
 * because there could be any number of configurations
 */
Generator.prototype.copyGulpfile = function()
{

};
/**
 * setup the package json with new deps
 */
Generator.prototype.setupPackage = function()
{

};
/**
 * show them a message about what to do next
 */
Generator.prototype.showMessage = function()
{

};
