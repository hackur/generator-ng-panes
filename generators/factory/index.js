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
 * generate the service file
 */
Generator.prototype.createServiceFiles = function()
{
    var moduleDir = this.checkModuleOption();
    this.generateSourceAndTest(
        'service/factory',
        'spec/service',
        'services',
        moduleDir
    );
};
