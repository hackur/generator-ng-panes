'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    yeoman.generators.NamedBase.apply(this, arguments);

    this.sourceRoot(path.join(__dirname, '..' , 'templates' , 'common'));
};

util.inherits(Generator, yeoman.generators.NamedBase);
/**
 * generate the view file
 */
Generator.prototype.createViewFiles = function()
{

    var moduleDir = this.checkModuleOption();

    var tpl = this.name.toLowerCase() + '.html';
    var appPath = this.env.options.appPath;

    var dest = (moduleDir!=='') ? path.join(appPath , 'scripts', moduleDir, 'views', tpl )
                                : path.join(appPath , 'views' , tpl);

    this.template(path.join('app','views','view.html'), dest );
};
