'use strict';
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);
/**
 * generate the filter file
 */
Generator.prototype.createFilterFiles = function()
{
    var moduleDir = this.checkModuleOption();

    this.generateSourceAndTest(
        'filter',
        'spec/filter',
        'filters',
        moduleDir
    );
};
