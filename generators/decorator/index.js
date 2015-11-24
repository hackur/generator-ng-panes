'use strict';

var fs = require('fs');
var util = require('util');
var path = require('path');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');


function buildRelativePath(fileName)
{
    return path.join('decorators', fileName + "Decorator");
}

/**
 * Constructor
 */
var Generator = module.exports = function(args, options) {
  ScriptBase.apply(this, arguments);
  this.fileName = this.name;

  if (typeof this.env.options.appPath === 'undefined') {
    this.env.options.appPath = this.options.appPath;

    if (!this.env.options.appPath) {
      try {
        this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
      } catch (e) {
          // nothing to do here
      }
    }
    this.env.options.appPath = this.env.options.appPath || 'app';
    this.options.appPath = this.env.options.appPath;
  }
};

util.inherits(Generator, ScriptBase);

/**
 * check if there is a decorator with the same name
 */
Generator.prototype.askForOverwrite = function() {
  var cb = this.async();

  // TODO: Any yeoman.util function to handle this?
  if (fs.existsSync(path.join(
    this.env.cwd, this.env.options.appPath,
    'scripts', buildRelativePath(this.fileName) + ".js"
  ))) {
    var prompts = [{
      type: 'confirm',
      name: 'overwriteDecorator',
      message: 'Would you like to overwrite existing decorator?',
      default: false
    }];

    this.prompt(prompts, function (props) {
      this.overwriteDecorator = props.overwriteDecorator;

      cb();
    }.bind(this));
  }
  else{
    cb();
    return;
  }
};

/**
 * ask for a name if its not already provided
 */
Generator.prototype.askForNewName = function() {
  var cb = this.async();

  if (this.overwriteDecorator === undefined || this.overwriteDecorator === true) {
    cb();
    return;
  }
  else {
    var prompts = [];
    prompts.push({
      name: 'decoratorName',
      message: 'Alternative name for the decorator'
    });

    this.prompt(prompts, function (props) {
      this.fileName = props.decoratorName;

      cb();
    }.bind(this));
  }
};
/**
 * generate the decorator file
 */
Generator.prototype.createDecoratorFiles = function()
{


    this.appTemplate(
        'decorator',
        path.join('scripts', buildRelativePath(this.fileName))
    );

};
