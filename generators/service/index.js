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
 * generate the service file
 */
Generator.prototype.createServiceFiles = function() {
  this.generateSourceAndTest(
    'service/service',
    'spec/service',
    'services',
    this.options['skip-add'] || false
  );
};
