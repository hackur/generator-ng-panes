'use strict';
/**
 * this is a Angular 2 only features
 */
 var util = require('util');
 var chalk = require('chalk');
 var path = require('path');
 var _ = require('underscore');
 var ScriptBase = require('../../lib/script-base.js');
 var preference = require('../../lib/preference');


/**
    create a new component for ng v.1.5
**/

var isAvailable = function()
{
    var bower = require(path.join(process.cwd() , 'bower.json'));
    return (bower.dependencies.angular.indexOf('1.5') > -1);
};

/**
 * Constructor
 */
var Generator = module.exports = function() {
     ScriptBase.apply(this, arguments);

     this.config = preference.getConfig();
     // check the bower file and see if they are using angular 1. 5
     if (!isAvailable()) {
         console.log(chalk.red('You need to use Angular V.1.5.x for this feature to work!'));
     }
};

util.inherits(Generator, ScriptBase);


/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{
    this.dasherizeName = _.dasherize(this.name);

    console.log(this.dasherizeName);
    console.log(this.cameledName);

    this.generateSourceAndTest(
        'component',
        'spec/component',
        'components',
        this.options['skip-add'] || false
    );
};
