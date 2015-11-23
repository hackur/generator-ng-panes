'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var glob = require('glob');
var chalk = require('chalk');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));

var us = require('underscore.string');

var angularUtils = require('./util');
var nbPreference = require('./preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    yeoman.generators.NamedBase.apply(this, arguments);

    var bowerJson = {};

    try {
        bowerJson = require(path.join(process.cwd(), 'bower.json'));
    } catch (e) {
        // nothing to do here
    }

    if (bowerJson.name) {
        this.appname = bowerJson.name;
    } else {
        this.appname = path.basename(process.cwd());
    }

    var human = us.humanize(this.appname);

    this.appname = us.slugify( human );

    if (!this.scriptAppName) {
        this.scriptAppName = bowerJson.moduleName || us.camelize( human ) + angularUtils.appName(this);
    }
    else {
        console.log('has name:' , this.scriptAppName);
    }

    // this should be using the name!

    var human1 = us.humanize(this.name);

    this.cameledName   = us.camelize( human1 , true);
    this.classedName   = us.classify( human1 );

    if (typeof this.env.options.appPath === 'undefined') {
        this.env.options.appPath = this.options.appPath || bowerJson.appPath || 'app';
        this.options.appPath = this.env.options.appPath;
    }

    this.env.options.testPath = this.env.options.testPath || bowerJson.testPath || 'test/spec';

    var ngConfig = nbPreference.getConfig();
    var settings = {};
    if (ngConfig) {
        settings = ngConfig;
    }

    this.option('cn' , {
        type: String,
        desc: 'Change to Chinese'
    });

    this.lang = (this.settings) ? this.settings.lang : (this.options.cn ? 'cn' : 'en');

    var sourceRoot = '../generators/templates/javascript';
    this.scriptSuffix = '.js';

    this.env.options.coffee = false;
    this.env.options.typescript = false;

    this.sourceRoot(path.join(__dirname, sourceRoot));

    // next interactive mode
    var interactive = {
        type: String,
        alias: 'ia',
        desc: (this.lang==='cn') ? '交互方式' : 'Interactive mode'
    };

    this.option('interactive' , interactive);

    this.interactive = this.options.interactive;

    this.option('component' , {
        type: String,
        alias: 'c',
        desc: 'Using component base without controller'
    });
    // setup an abstract state
    this.option('abstract' , {
        type: String,
        desc: 'Add abstract state without calling other sub generators'
    });
    // this only apply to directive or component
    this.option('ext' , {
        type: String,
        desc: 'notify sub generator to create external file instead of inline template'
    });
};

util.inherits(Generator, yeoman.generators.NamedBase);

/**
 * add a template file
 */
Generator.prototype.appTemplate = function(src, dest)
{
    yeoman.generators.Base.prototype.template.apply(this, [
        src + this.scriptSuffix,
        path.join(this.env.options.appPath, dest.toLowerCase()) + this.scriptSuffix
    ]);
};

/**
 * test the template file
 */
Generator.prototype.testTemplate = function(src, dest)
{
    yeoman.generators.Base.prototype.template.apply(this, [
        src + this.scriptSuffix,
        path.join(this.env.options.testPath, dest.toLowerCase()) + this.scriptSuffix
    ]);
};

/**
 * generate html template
 */
Generator.prototype.htmlTemplate = function(src, dest)
{
    yeoman.generators.Base.prototype.template.apply(this, [
        src,
        path.join(this.env.options.appPath, dest.toLowerCase())
    ]);
};

/**
 * this is getting re-use everywhere
 */
Generator.prototype.generateSourceAndTest = function(appTemplate, testTemplate, targetDirectory, skipAdd)
{
    if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
        this.cameledName = this.classedName;
    }
    this.appTemplate(appTemplate, path.join('scripts', targetDirectory, this.name));
    this.testTemplate(testTemplate, path.join(targetDirectory, this.name));
};


/**
 * append script to index.html
 */
Generator.prototype.addScriptToIndex = function(script)
{
    try {
        if (this.options.panesConfig) {
            return;
        }
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, 'index.html');
        angularUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                '<script src="scripts/' + script.toLowerCase().replace(/\\/g, '/') + '.js"></script>'
            ]
        });
    } catch (e) {
        if (this.env.options.installing) {
            // this.log.error(' Supress an error');
            return;
        }
        // @TODO figure out why this is happening
        this.log.error(chalk.yellow(
            '\nUnable to find ' + fullPath + '. Reference to ' + script + '.js ' + 'not added.\n'
        ));
    }
};
