'use strict';
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var angularUtils = require('../../lib/util.js');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);

    this.option('uri', {
        desc: 'Allow a custom uri for routing',
        type: String,
        required: false
    });

    this.config = preference.getConfig();
    this.routerType = this.config.ngRoute;

    // set up a new flag to use component instead of a controller
    if (!this.options.abstract) {
        var args = [this.name];
        if (this.options.component) {
            this.composeWith('ng-panes:component' , {args: args});
        }
        else {
            this.composeWith('ng-panes:controller' , {args: args});
        }
        this.composeWith('ng-panes:view' , {args: args});
    }
};

util.inherits(Generator, ScriptBase);

/**
 * ask if the user want to overwrite the existing file
 */
Generator.prototype.rewriteAppJs = function()
{
    // new options TODO to integrate it
    var moduleDir = this.checkModuleOption();
    var appJsFile = (moduleDir==='') ? path.join('scripts' , 'app.js')
                                     : path.join('scripts' , 'modules' , moduleDir , 'module.js');

    this.uri = this.name;

    if (this.options.uri) {
        this.uri = this.options.uri;
    }

    var config = {
        file: path.join(
            this.env.options.appPath,
            appJsFile
        ),
        needle: '.otherwise'};
    var lower = this.name.toLowerCase();
    switch (this.routerType) {
        case 'ui-router':
            // config.needle = "$urlRouterProvider.otherwise('/');";
            config.splicable = [
                " url: '/"+ lower + "',",
            ];

            if (this.options.abstract) {
                config.splicable.push('    abstract: true,');
                config.splicable.push('    template: "<div ui-view></div>"');
            } else {
                if (!this.options.component) {
                    config.splicable.push("    controller: '" + this.classedName + "Ctrl'" +  ",");
                    config.splicable.push("    controllerAs: '" + this.cameledName + "',");
                }
                config.splicable.push("   templateUrl: 'views/" + lower + ".html'");
            }

            config.splicable.unshift("   $stateProvider.state('" + this.uri + "' , {");
            config.splicable.push("});");
        break;
        // there got to have one now
        // case 'ngRoute':
        default:
            config.splicable = [
                "    templateUrl: 'views/" + lower + ".html', ",
                "    controller: '" + this.classedName + "Ctrl',",
                "    controllerAs: '"+ this.cameledName + "'"
            ];
            config.splicable.unshift(".when('/" + this.uri + "', {");
            config.splicable.push("})");
        break;
    }
    angularUtils.rewriteFile(config);

};
