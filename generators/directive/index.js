'use strict';

var util = require('util');
var path = require('path');
var _ = require('underscore');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');


/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);

    this.externalTemplate = (this.options.ext) ? this.options.ext : false;
};

util.inherits(Generator, ScriptBase);

/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{

    this.dasherizeName = _.dasherize(this.name);

    if (this.externalTemplate !== false) {
        this.externalTemplate = 'views/directives/' + this.dasherizeName + '.html';
    }

    this.generateSourceAndTest(
        'directive',
        'spec/directive',
        'directives',
        this.options['skip-add'] || false
    );

    // generate external file
    if (this.externalTemplate !== false) {
        this.htmlTemplate(
            path.join('..', 'common' , 'app' , 'views' , 'directive.html'),
            this.externalTemplate
        );
    }
};
