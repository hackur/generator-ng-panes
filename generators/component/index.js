'use strict';
/**
 * this is a Angular 1.5 only features
 */
var util = require('util');
var path = require('path');
var chalk = require('chalk');
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
var Generator = module.exports = function()
{
     ScriptBase.apply(this, arguments);

     this.config = preference.getConfig();
     // check the bower file and see if they are using angular 1. 5
     if (!isAvailable()) {
         console.log(chalk.red('You need to use Angular V.1.5.x for this feature to work!'));
     }

     var notpl = (this.env.options.notpl || this.options.notpl);
     // use external file
     this.externalTemplate = (notpl) ? false : true;

     this.whatType = 'Component';

};

util.inherits(Generator, ScriptBase);

/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{
    this.dasherizeName = _.dasherize(this.name);

    this.cssClassName = this.dasherizeName + '-' + this.whatType.toLowerCase();  

    var moduleDir = this.checkModuleOption();

    if (this.externalTemplate !== false) {
        this.externalTemplate = (moduleDir!=='') ? path.join('scripts' , 'modules' , moduleDir , 'views' , 'components' , this.dasherizeName + '.html')
                                                 : path.join('views' , 'components' , this.dasherizeName + '.html');

        this.externalTemplate = this.fixPath(this.externalTemplate);
    }

    this.generateSourceAndTest(
        'component',
        'spec/component',
        'components',
        moduleDir
    );
    // generate external file
    if (this.externalTemplate !== false) {

        this.htmlTemplate(
            path.join('..', 'common' , 'app' , 'views' , 'directive.html'),
            this.externalTemplate
        );
    }
};
