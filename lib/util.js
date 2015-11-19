'use strict';
var path = require('path');
var fs = require('fs');
var fileExist = require('exists-file');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));

/**
    global helpers
**/

/**
 * escape certain based on pattern
 */
var escapeRegExp = function(str)
{
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};
/**
 * rewrite the templates
 */
var rewrite = function(args)
{
    /* jshint -W044 */
    // check if splicable is already in the body text
    var re = new RegExp(args.splicable.map(function (line) {
            return '\s*' + escapeRegExp(line);
        }).join('\n'));
    if (re.test(args.haystack)) {
        return args.haystack;
    }
    var lines = args.haystack.split('\n');
    var otherwiseLineIndex = 0;
    lines.forEach(function (line, i) {
        if (line.indexOf(args.needle) !== -1) {
            otherwiseLineIndex = i;
        }
    });
    var spaces = 0;
    while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
        spaces += 1;
    }
    var spaceStr = '';
    while ((spaces -= 1) >= 0) {
        spaceStr += ' ';
    }
    lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
        return spaceStr + line;
    }).join('\n'));
    return lines.join('\n');
};

/**
 * rewrite the file
 */
var rewriteFile = function(args)
{
    args.path = args.path || process.cwd();
    var fullPath = path.join(args.path, args.file);
    args.haystack = fs.readFileSync(fullPath, 'utf8');
    var body = rewrite(args);
    fs.writeFileSync(fullPath, body);
};

/**
 * getting the appName and test if we want to add app-suffix
 * REMOVE LATER - we don't use this app-suffix anymore
 */
var appName = function(self)
{
    var counter = 0, suffix = self.options['app-suffix'];
    // Have to check this because of generator bug #386
    process.argv.forEach(function(val) {
        if (val.indexOf('--app-suffix') > -1) {
            counter++;
        }
    });
    if (counter === 0 || (typeof suffix === 'boolean' && suffix)) {
        suffix = 'App';
    }
    return suffix ? _.classify(suffix) : '';
};

/**
 * v0.9.10 when the user is running in the panesjs setup ui mode
 * we need to merge the two package.json files
 */
var mergePackages = function(newPackage)
{
    try {
        var file = path.join(process.cwd() , newPackage);
        var packageFile = './package.json';
        var ngPanesPackage = require(file);
        var packages = require(packageFile);
        var allPackages = _.extend(packages , ngPanesPackage.devDependencies);
        return fs.writeFileSync(packageFile, JSON.stringify(allPackages , null , 4));
    } catch(e) {
        return false;
    }
};

/**
 * need a cross platform solution to generate directory
 * just to keep it simple, we supply an array
 */
var mkdirFull = function(base , paths , callback)
{
    var nextPath = [];
    var ctn = paths.length;
    var i;
    var destPaths = [];
    var dest = base;
    for (i=0; i<ctn; ++i) {
        dest = path.join(dest , paths[i]);
        fs.mkdirSync(dest);
    }
    callback();
};

/**
 * export it back
 */
module.exports = {
    rewrite: rewrite,
    rewriteFile: rewriteFile,
    appName: appName,
    mergePackages: mergePackages,
    mkdirFull: mkdirFull
};
// -- EOF --
