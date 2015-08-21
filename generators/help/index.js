'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');
var chalk = require('chalk');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs');
/**

	@TODO this is the help command evoke by
	`yo angular:help`
	options --interactive
**/
var Generator = module.exports = function Generator() {
	//ScriptBase.apply(this, arguments);
	yeoman.generators.NamedBase.apply(this, arguments);
  	//console.log(arguments);
	if (this.option('interactive') || this.option('ia')) {
		this.interactive = true;
	}
};

util.inherits(Generator, ScriptBase);

Generator.prototype.showHelpFiles = function showHelpFiles()
{
	var isInt = this.interactive ? ' interactive mode' : 'nope';
	this.log(chalk.blue('Here is the help') + ' ' + isIn);
};
