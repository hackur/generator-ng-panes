'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');

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
