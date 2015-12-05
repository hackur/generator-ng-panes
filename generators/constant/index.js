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
 * generate a service constant
 */
Generator.prototype.createServiceFiles = function()
{
    this.getPassValue();

    var moduleDir = this.checkModuleOption();

    this.generateSourceAndTest(
        'service/constant',
        'spec/service',
        'services',
        moduleDir
    );
};
