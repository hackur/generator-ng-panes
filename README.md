#yeoman generator-ng-panes 前端开发神器

基于[generator-angular](https://github.com/yeoman/generator-angular)再开发，加入了许多新功能和为io.js 兼容作好准备。

#新加入的功能

1. 可选多种不同的界面库: [Bootstrap, Bootstrap-Sass](http://getbootstrap.com), [Foundation](http://foundation.zurb.com/), [Semantic-UI](http://semantic-ui.com/) , [Angular-Material](https://material.angularjs.org), [Materialize](), [UIKit](http://getuikit.com/) and [AmazeUI](http://materializecss.com/).
2. 当angular 2进入beta时，你可以选不同版本。
3. 使用gulp为任务助手。
4. 模塊使用模式加入(不在HTML里加attribute), 让开发者更简单地改用AMD方案。
5. 內部开发改善，一起步便mini safe。
6. 可选中文。`yo ng-panes --cn`

还有更多

这是panes.js框架系列的其中一个开发助手工具。

#Intro

Based on the original [generator-angular](https://github.com/yeoman/generator-angular) with some extra methods,
and getting it ready to work with io.js.

##NEW FEATURES

1. Allow you to choose from different UI framework: [Bootstrap, Bootstrap-Sass](http://getbootstrap.com), [Foundation](http://foundation.zurb.com/), [Semantic-UI](http://semantic-ui.com/) , [Angular-Material](https://material.angularjs.org), [Materialize](), [UIKit](http://getuikit.com/) and [AmazeUI](http://materializecss.com/).
2. This generator will be ready for AngularJS 2.0 when its ready. At the moment, ask you if you want to use V1 or V2 (but it will always set to V1 for the time being).
3. This generator will use Gulp by default.
4. The dist compilation will be little different, all templates will get generate into js files.
5. The Angular module configuration will be a little bit different. It will use angular DOM attachment instead of writing it into the HTML. This will give you the opportunity to use dynamic loading scheme.
6. Chinese option!

And more.

This is part of the panes.js series of tools.

##How To

Coming soon.

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
