'use strict';
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function() {
  ScriptBase.apply(this, arguments);
};

util.inherits(Generator, ScriptBase);
/**
 * generate the provider file
 */
Generator.prototype.createServiceFiles = function() {
  this.generateSourceAndTest(
    'service/provider',
    'spec/provider',
    'services',
    this.options['skip-add'] || false
  );
};
