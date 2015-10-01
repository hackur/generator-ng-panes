'use strict';
/**
 * this is a Angular 2 only features
 */
 var util = require('util');
 var ScriptBase = require('../../lib/script-base.js');
 var _ = require('underscore');
 /**
  * Constructor
  */
 var Generator = module.exports = function() {
     ScriptBase.apply(this, arguments);
 };

 util.inherits(Generator, ScriptBase);

Generator.prototype.askForSeletorName = function()
{
    // default name
    this.selectorName = 'app';

    if (this.options['ia']) {
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
};


 /**
  * generate the directive file
  */
 Generator.prototype.createDirectiveFiles = function() {

     this.dasherizeName = _.dasherize(this.name);

     this.generateSourceAndTest(
         'component',
         'spec/component',
         'directives',
         this.options['skip-add'] || false
     );
 };
