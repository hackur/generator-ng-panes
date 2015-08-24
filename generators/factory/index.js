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
 * generate the service file 
 */
Generator.prototype.createServiceFiles = function() {
  this.generateSourceAndTest(
    'service/factory',
    'spec/service',
    'services',
    this.options['skip-add'] || false
  );
};
