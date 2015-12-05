;(function()
{
    'use strict';

    /**
     * @ngdoc service
     * @name <%= scriptAppName %>.<%= cameledName %>
     * @description
     * # <%= cameledName %>
     * Value in the <%= scriptAppName %>.
     */
    angular.module('<%= scriptAppName %>').value('<%= cameledName %>', <% if (passValue) { %><%= passValue %><% } else { %>42<% } %>);

}());
