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
        <% if (!externalTemplate) { %>
        var tpl = '<div></div>';
        <% } %>
        // define your controller
        var ctrl = function($scope)
        {

        };

        return {
            <% if (externalTemplate) { %>
    		templateUrl: '<%= externalTemplate %>',
    		<% } else { %>
            template: tpl,
            <% } %>
            restrict: 'E',
            scope: {},
            controller: ctrl,
            controllerAs: '<%= cameledName %>',
    		// bindToController: {}, // change the bindToController
            link: function(scope, element, attrs)
            {
                element.text('this is the <%= cameledName %> directive');
            }
        };
    });
}());
