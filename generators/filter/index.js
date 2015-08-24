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
 * generate the filter file 
 */
Generator.prototype.createFilterFiles = function() {
  this.generateSourceAndTest(
    'filter',
    'spec/filter',
    'filters',
    this.options['skip-add'] || false
  );
};
