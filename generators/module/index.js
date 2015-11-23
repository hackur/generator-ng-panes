'use strict';
/**
 * This will create the module structure
 */
var util = require('util');
var path = require('path');
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

Generator.prototype.createModuleFile = function()
{
	this.moduleName = us.camelize( this.name , true);
	this.ngRoute = this.config.ngRoute;

	this.appTemplate(
		'module',
		'modules/' + this.moduleName + '/module'
	);

	var moduleName = require('./bower.json').moduleName;

	// next add this new module to the app.js
	var start = 'angular.module(\''+ moduleName + '\', [';
	
};
