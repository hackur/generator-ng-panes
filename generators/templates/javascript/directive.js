(function()
{
    'use strict';

    /**
     * @ngdoc directive
     * @name <%= scriptAppName %>.directive:<%= cameledName %>
     * @description
     * # <%= cameledName %>
     */
    angular.module('<%= scriptAppName %>').directive('<%= cameledName %>', function()
    {
        // define your template
        var tpl = '<div></div>';
        // define your controller
        var ctrl = function($scope)
        {

        };

        return {
            template: tpl,
            // templateUrl: '',
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: '<%= cameledName %>',
            link: function(scope, element, attrs)
            {
                element.text('this is the <%= cameledName %> directive');
            }
        };
    });
}());
