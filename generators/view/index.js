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

    this.template(
        'app/views/view.html',
        path.join(
            this.env.options.appPath,
            moduleDir,
            'views',
            this.name.toLowerCase() + '.html'
        )
    );
};
