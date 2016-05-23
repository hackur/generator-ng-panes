;(function()
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
        <% if (!externalTemplate && !slim) { %>
        // define your template
        var <%= cameledName %>Tpl = '<div></div>';
        <% } %>
        <% if (!slim) { %>
        // define your controller
        var <%= cameledName %>DirectiveCtrl = function($scope)
        {

        };<% } %>
        // export
        return {
            <% if (externalTemplate && !slim) { %>templateUrl: '<%= externalTemplate %>',<% } else if (!externalTemplate && !slim) { %>template: <%= cameledName %>Tpl,<% } %>
            restrict: '<%= restrictValue %>',
            scope: {},
            <% if (!slim) { %>controller: <%= cameledName %>DirectiveCtrl, // ngAnnotate will do the injection
            controllerAs: '<%= cameledName %>',
    		// bindToController: {}, // change the bindToController
            <% } %>link: function(scope, element, attrs)
            {
                <% if (!slim) { %>element.text('this is the <%= cameledName %> directive');<% } %>
            }
        };
    });
}());
