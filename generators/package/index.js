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

var exec = require('child_process').exec,
    child;


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
    var self = this;

    // reset the path
    self.sourceRoot(path.join(__dirname , '..' , 'generatros' , 'templates', 'common' , 'root'));
    self.copy('_build_release.js' , 'gulp_release.js');

    // just append this file to the gulpfile.js
    fs.appendFile('./gulpfile.js' , "\r\n\/\/ append by ng-panes generator \r\n" + 'gulp_release.js' + "\r\n" , function(err)
    {
        if (err) {
            console.log(chalk.red('fail to append to file'));
            console.log('error' , err);
        }
        else {
            self._setupPackage();
        }
    });
};
/**
 * setup the package json with new deps
 */
Generator.prototype._setupPackage = function()
{
    // var packageFile = require('./package.json');
    // there is no need to write the file, just execute the npm install and that's it right,
    var cmd = "npm install --save-dev gulp-shell gulp-bump yargs";
    exec(cmd , function(err)
    {
        if (err) {
            console.log(chalk.red('fail to run npm command'));
            console.log('error' , err);
        }
        else {
            console.log('You can now open the gulp_release.js file on your project root and customize to your need.');
        }
    });
};
