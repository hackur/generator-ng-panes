'use strict';
/**
 * this is a Angular 2 only features
 */
 var util = require('util');
 var _ = require('underscore');
 var ScriptBase = require('../../lib/script-base.js');
 var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function() {
     ScriptBase.apply(this, arguments);

     this.config = preference.getConfig();
     /**
        if they are using Angular V.1 and using ui-router then this will be available
        for them to create component style, get ready for the next gen development
     **/
     if (this.config.angularBigVer !== 2) {
         if (this.config.ngRoute !=='ui-router') {
             var msg = this.config.lang === 'en' ? 'This is Angular 2 only feature!'
                                            : '这是 Angular 2 的特有功能！';
            this.log.error(msg);
            throw 'wrong version';
        }
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
