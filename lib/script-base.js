'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var glob = require('glob');
var chalk = require('chalk');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var angularUtils = require('./util');
var nbPreference = require('./preference');

/**
 * Constructor
 */
var Generator = module.exports = function() {
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

    this.appname = _.slugify(_.humanize(this.appname));
    this.scriptAppName = bowerJson.moduleName || _.camelize(this.appname) + angularUtils.appName(this);
    this.cameledName = _.camelize(this.name);
    this.classedName = _.classify(this.name);

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

    if (settings.angularBigVer===2) {
        sourceRoot = '../generators/templates/angular2';
        this.scriptSuffix = '.ts';
        this.env.options.typescript = this.options.typescript = true;
    }
    else {

        if (settings['scriptingLang']) {
            this.env.options.coffee = (settings['scriptingLang']==='CS');
            this.env.options.typescript = (settings['scriptingLang']==='TS');
        }

        if (this.env.options.coffee) {
            sourceRoot = '../generators/templates/coffeescript';
            this.scriptSuffix = '.coffee';
        }

        if (this.env.options.typescript) {
            sourceRoot = '../generators/templates/typescript';
            this.scriptSuffix = '.ts';
        }
    }

    this.sourceRoot(path.join(__dirname, sourceRoot));

    // next interactive mode
    var interactive = {
        type: String,
        desc: (this.lang==='cn') ? '交互方式' : 'Interactive mode'
    };

    this.option('interactive' , interactive);
    this.option('ia' , interactive);
    this.interactive = this.options.interactive || this.options.ia;

};

util.inherits(Generator, yeoman.generators.NamedBase);

/**
 * add a template file
 */
Generator.prototype.appTemplate = function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
        src + this.scriptSuffix,
        path.join(this.env.options.appPath, dest.toLowerCase()) + this.scriptSuffix
    ]);
};

/**
 * test the template file
 */
Generator.prototype.testTemplate = function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
        src + this.scriptSuffix,
        path.join(this.env.options.testPath, dest.toLowerCase()) + this.scriptSuffix
    ]);
};

/**
 * generate html template
 */
Generator.prototype.htmlTemplate = function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
        src,
        path.join(this.env.options.appPath, dest.toLowerCase())
    ]);
};
/**
 * append script to index.html
 */
Generator.prototype.addScriptToIndex = function(script) {
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
/**
 * this is getting re-use everywhere
 */
Generator.prototype.generateSourceAndTest = function(appTemplate, testTemplate, targetDirectory, skipAdd) {
    if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
        this.cameledName = this.classedName;
    }
    this.appTemplate(appTemplate, path.join('scripts', targetDirectory, this.name));
    this.testTemplate(testTemplate, path.join(targetDirectory, this.name));
    if (!skipAdd) {
        this.addScriptToIndex(path.join(targetDirectory, this.name));
    }
};
