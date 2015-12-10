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
 */
Generator.prototype.startQuestion = function()
{

};
