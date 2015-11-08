'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
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
 * generate the app.js file
 */
Generator.prototype.createAppFile = function()
{

    this.angularModules = this.env.options.angularDeps;

    // console.log(this.angularModules);

    this.ngCookies = this.env.options.ngCookies;
    this.ngResource = this.env.options.ngResource;
    this.ngSanitize = this.env.options.ngSanitize;
    this.ngRoute = this.env.options.ngRoute;

    this.appTemplate('app', 'scripts/app');
};
