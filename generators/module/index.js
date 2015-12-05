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

Generator.prototype.createModuleFile = function()
{
	this.moduleName = us.camelize( this.name , true);
	this.ngRoute = this.config.ngRoute;

	this.appTemplate(
		'module',
		path.join('scripts','modules' , this.moduleName , 'module')
	);

	// now add the module to the app.js file
	var app_js_file = path.join('app','scripts','app.js');
	var appJsFile = fs.readFileSync(app_js_file, 'utf-8');
	var pattern = new RegExp(/(angular\.module\(')(.*)(\]\))/gi);
	var matches = appJsFile.match(pattern);
	if (matches) {
		var pattern1 = new RegExp('\\]\\)' + '$');
		var line = matches[0].replace(pattern1 , ",'" + this.moduleName + "'])");
		var newFile = appJsFile.replace(pattern , line);

		fs.writeFile(app_js_file , newFile , 'utf-8' , function(error)
		{
			if (error) {
				console.log(chalk.red('Fail to write to app.js file!'));
			}
		});
	}
	else {
		console.log(chalk.red('Could not find angular module. Did you modified it? Please manually add your module.'));
	}
};
