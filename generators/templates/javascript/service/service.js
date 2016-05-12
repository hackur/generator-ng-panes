;(function()
{
    'use strict';

    /**
     * @ngdoc service
     * @name <%= scriptAppName %>.<%= cameledName %>
     * @description
     * # <%= cameledName %>
     * Service in the <%= scriptAppName %>.
     */
    angular.module('<%= scriptAppName %>').service('<%= cameledName %>', function()
    {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var self = this;
        // inject your method into the self.yourMethod = function() {} etc

        return self;
    });

}());
