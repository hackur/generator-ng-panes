'use strict';
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var _ = require('underscore');
var preference = require('../../lib/preference');


/**
 * Constructor
 */
var Generator = module.exports = function() {
    ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);

/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{

    this.dasherizeName = _.dasherize(this.name);

    this.generateSourceAndTest(
        'directive',
        'spec/directive',
        'directives',
        this.options['skip-add'] || false
    );
};
