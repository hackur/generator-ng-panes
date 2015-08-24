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
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function() {
  this.generateSourceAndTest(
    'directive',
    'spec/directive',
    'directives',
    this.options['skip-add'] || false
  );
};
