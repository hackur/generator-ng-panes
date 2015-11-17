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

Generator.prototype.askForSeletorName = function()
{
    // default name
    this.selectorName = 'app';
    if (this.config.angularBigVer > 1) {
        if (this.options.ia) {
            var cb = this.async();
            this.prompt({
                type: 'input',
                name: 'selectorName',
                message: (this.lang==='en') ? 'What is the name of your selector?' : '',
                default: this.selectorName
            } , function(props) {
                cb();
                this.selectorName = props.selectorName;
            }.bind(this));
        }
    }
};

/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{
    this.dasherizeName = _.dasherize(this.name);
    if (this.config.angularBigVer > 1) {
        this.generateSourceAndTest(
            'component',
            'spec/component',
            'components',
            this.options['skip-add'] || false
        );
    }
    else {
        /**
            we need to create 4 files here
            1. create a folder with the same name
            2. a module.js with the name as module
            3. a controller file with the same name with [name].controller.js
            4. a service file with [name].service.js
            5. a template file in the template folder
        **/
        this.generateSourceAndTest(
            'controller',
            'spec/controller',
            'components/' + this.name,
            this.options['skip-add'] || false
        );

    }
};
