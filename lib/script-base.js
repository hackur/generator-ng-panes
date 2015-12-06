'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var glob = require('glob');
var chalk = require('chalk');
var existsFile = require('exists-file');
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
    /**
     * the new language options
     */
    this.option('lang' , {
        type: String,
        desc: 'Change language'
    });

    // this will be delete later
    this.option('cn' , {
        type: String,
        desc: 'Change to Chinese'
    });

    this.lang = (this.settings) ? this.settings.lang : (this.options.cn ? 'cn' : 'en');

    var sourceRoot = path.join('..' , 'generators' , 'templates', 'javascript');
    this.scriptSuffix = '.js';

    this.env.options.coffee = false;
    this.env.options.typescript = false;

    this.baseSourceRoot = path.join(__dirname, sourceRoot);

    this.sourceRoot(this.baseSourceRoot);

    // next interactive mode
    var interactive = {
        type: String,
        alias: 'ia',
        desc: (this.lang==='cn') ? '交互方式' : 'Interactive mode',
        required: false
    };

    this.option('interactive' , interactive);

    this.interactive = this.options.interactive;

    this.option('component' , {
        type: String,
        alias: 'c',
        desc: 'Using component base without controller',
        required: false
    });

    // setup an abstract state
    this.option('abstract' , {
        type: String,
        desc: 'Add abstract state without calling other sub generators',
        required: false
    });

    // this only apply to directive or component - 2 Dec 2015 do this the other way around
    /*
    this.option('ext' , {
        type: String,
        desc: 'notify sub generator to create external file instead of inline template',
        required: false
    });
    */
    this.option('notpl' , {
        type: String,
        desc: 'notify sub generator not to create external template',
        required: false
    });

    // this is for adding files to the right module
    this.option('module' , {
        type: String,
        desc: 'Adding this flag to tell sub generator where to put the file',
        required: false
    });

    // this is for the constant and value
    this.option('value' , {
        type: String,
        desc: 'Adding this flag to supply a value or file path to the sub generator',
        required: false
    });

};

util.inherits(Generator, yeoman.generators.NamedBase);

/**
 * check if the user has provide the module option and if its valid or not
 */
Generator.prototype.checkModuleOption = function()
{
    if (this.options.module) {
        if (us.isBlank(this.options.module)) {
            throw 'You must provide a module name!';
        }
        var moduleName = this.options.module;
        // test if we could open the module file
        try {
            var searchPath = path.join(process.cwd() , 'app' , 'scripts' ,  'modules' , moduleName , 'module.js');
            if (existsFile(searchPath.toLowerCase())) {
                // overwrite the existing module name
                this.scriptAppName = moduleName;
                return moduleName.toLowerCase();
            }
        } catch(e) {
            throw 'The module file does not exist. You need to first run `yo ng-panes:module `' + moduleName + '` [' + this.options.module + ']';
        }
    }
    return ''; // the reason not passing false is we could just put this in the path.join and if its empty just got ignored
};

/**
 * allow to pass the --value _VALUE_
 * if there is an extension json. Then we try to search for the file
 * otherwise we just pass it as its
 */
Generator.prototype.getPassValue = function()
{
    this.passValue = false;
    if (this.options.value) {
        if (us.isBlank(this.options.value)) {
            return false;
        }
        var value = this.options.value + ''; // need to turn to string first
        if (value.substr(-5).toLowerCase() === '.json') {
            var file = path.join(process.cwd() , value);
            if (existsFile(file)) {
                var json = require(file);
                value = JSON.stringify(json);
            }
            else {
                console.log(chalk.yellow(value + ' not found'));
                return false;
            }
        }
        else {
            value = "'" + value.replace("'" , "\'") + "'";
        }
        this.passValue = value;
        return value;
    }
    return false;
};

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
Generator.prototype.generateSourceAndTest = function(appTemplate, testTemplate, targetDirectory, moduleDir)
{
    if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
        this.cameledName = this.classedName;
    }

    var appFile = (moduleDir) ? path.join('scripts', 'modules' , moduleDir , targetDirectory , this.name)
                              : path.join('scripts', targetDirectory, this.name);
    var testFile = (moduleDir) ? path.join(moduleDir , targetDirectory , this.name)
                               : path.join(targetDirectory, this.name);

    this.appTemplate(appTemplate, appFile);
    this.testTemplate(testTemplate, testFile);
};




/**
 * append script to index.html - this is not in use anymore [DELETE]
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
