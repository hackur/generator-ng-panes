;(function()
{
    'use strict';

    /**
     * @ngdoc directive
     * @name <%= scriptAppName %>.directive:<%= cameledName %>
     * @description
     * # <%= cameledName %>
     */
    angular.module('<%= scriptAppName %>').directive('<%= cameledName %>', [function()
    {
        <% if (!externalTemplate) { %>
        // define your template
        var <%= cameledName %>Tpl = '<div></div>';
        <% } %>
        // define your controller
        var <%= cameledName %>DirectiveCtrl = function($scope)
        {

        };

        return {
            <% if (externalTemplate) { %>templateUrl: '<%= externalTemplate %>',<% } else { %>template: <%= cameledName %>Tpl,<% } %>
            restrict: 'E',
            scope: {},
            controller: ['$scope' , <%= cameledName %>DirectiveCtrl],
            controllerAs: '<%= cameledName %>',
    		// bindToController: {}, // change the bindToController
            link: function(scope, element, attrs)
            {
                element.text('this is the <%= cameledName %> directive');
            }
        };
    }]);
}());
