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
 * @date 2016-5-6
 * fix the naming when there is dot in it
 */
Generator.prototype.fixModuleName = function(name)
{
    if (name.indexOf('.')>-1) {
        return name.split('.').map(function(n)
        {
            return us.classify(n);
        }).reduce(function(last , n)
        {
            return last.concat(n);
        });
    }
    return name;
}

/**
 * final call to generate the module file
 */
Generator.prototype.createModuleFile = function()
{
	this.moduleName = us.camelize( this.name , true);
    // the above moduleName didn't recognize the dot notation
    this.moduleStringName = this.fixModuleName(this.moduleName);

	this.ngRoute = this.config.ngRoute;

	this.appTemplate(
		'module',
		path.join('scripts','modules' , this.moduleName , 'module')
	);

	// now add the module to the app.js file
	var app_js_file = path.join('app','scripts','app.js');
	var appJsFile = fs.readFileSync(app_js_file, 'utf-8');
    // need to look at this regex to figure out how to do the module in multiple line
	var pattern = new RegExp(/(angular\.module\(')(.*)([\s\S]\]\))/gi);
	var matches = appJsFile.match(pattern);
	if (matches) {
		var pattern1 = new RegExp('\\]\\)' + '$');
		var line = matches[0].replace(pattern1 , ",\n'" + this.moduleName + "'\t\n])");
		var newFile = appJsFile.replace(pattern , line);

		fs.writeFile(app_js_file , newFile , 'utf-8' , function(error)
		{
			if (error) {
				console.log(chalk.red('Fail to write to app.js file!'));
			}
		});
	}
	else {
		console.log(
            chalk.red(
                'Could not find angular module. Did you modified it? Please manually add your module.'
            )
        );
	}
};
