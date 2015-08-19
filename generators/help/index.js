'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');
var chalk = require('chalk');
/**

	@TODO this is the help command evoke by
	`yo angular:help`
	options --interactive
**/
var Generator = module.exports = function Generator() {
  	console.log(arguments);
	//ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);

Generator.prototype.showHelpFiles = function showHelpFiles()
{
	console.log(chalk.blue('Here is the help'));
};
