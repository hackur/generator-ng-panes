'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var preference = require('../../lib/preference');
var ScriptBase = require('../../lib/script-base.js');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);

    this.sourceRoot(path.join(__dirname, '..' , 'templates' , 'common'));
};

util.inherits(Generator, ScriptBase);
/**
 * generate the view file
 */
Generator.prototype.createViewFiles = function()
{

    var moduleDir = this.checkModuleOption();

    var tpl = this.name.toLowerCase() + '.html';
    var appPath = this.options.appPath;

    var dest = (moduleDir!=='') ? path.join('scripts', moduleDir, 'views', tpl )
                                : path.join('views' , tpl);

    var src = path.join('app','views','view.html');

    this.htmlTemplate(src , dest);
};
