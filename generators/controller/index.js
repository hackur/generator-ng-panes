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
    // if the controller name is suffixed with ctrl, remove the suffix
    // if the controller name is just "ctrl," don't append/remove "ctrl"
    if (this.name && this.name.toLowerCase() !== 'ctrl' && this.name.substr(-4).toLowerCase() === 'ctrl') {
        this.name = this.name.slice(0, -4);
    }

    if (this.options.scriptAppName) {
        this.scriptAppName = this.options.scriptAppName;
    }
};

util.inherits(Generator, ScriptBase);

/**
 * generate a controller
 */
Generator.prototype.createControllerFiles = function()
{
    var moduleDir = this.checkModuleOption();

    this.generateSourceAndTest(
        'controller',
        'spec/controller',
        'controllers',
        moduleDir
    );

};
