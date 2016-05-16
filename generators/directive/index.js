'use strict';

var util = require('util');
var path = require('path');
var _ = require('underscore');
var ScriptBase = require('../../lib/script-base.js');
var preference = require('../../lib/preference');


/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);

    var notpl = (this.env.options.notpl || this.options.notpl);
    // use external file
    this.externalTemplate = (notpl) ? false : true;
};

util.inherits(Generator, ScriptBase);

/**
 * generate the directive file
 */
Generator.prototype.createDirectiveFiles = function()
{
    var moduleDir = this.checkModuleOption();

    this.dasherizeName = _.dasherize(this.name);

    if (this.externalTemplate !== false) {
        this.externalTemplate = (moduleDir!=='') ? path.join('scripts' , 'modules' , moduleDir , 'views' , 'directives' , this.dasherizeName + '.html')
                                                 : path.join('views' , 'directives' , this.dasherizeName + '.html');
    }

    this.generateSourceAndTest(
        'directive',
        'spec/directive',
        'directives',
        moduleDir
    );

    // generate external file
    // JASON discover a bug - the template not generated in the module when there is a module flag
    if (this.externalTemplate !== false) {
        this.htmlTemplate(
            path.join('..' , 'common' , 'app' , 'views' , 'directive.html'),
            this.externalTemplate
        );
    }
};
