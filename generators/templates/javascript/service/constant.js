;(function()
{
    'use strict';

    /**
     * @ngdoc service
     * @name <%= scriptAppName %>.<%= cameledName %>
     * @description
     * # <%= cameledName %>
     * Constant in the <%= scriptAppName %>.
     */
<<<<<<< HEAD
    angular.module('<%= scriptAppName %>').constant('<%= cameledName %>', <% if (passValue) { %><%- passValue%><% } else { %>42<% } %>);
=======
    angular.module('<%= scriptAppName %>').constant('<%= upperedName %>', <% if (passValue) { %><%- passValue%><% } else { %>42<% } %>);
>>>>>>> c16b038bc2541a1ec3e8233550cde1418377f72d
}());
