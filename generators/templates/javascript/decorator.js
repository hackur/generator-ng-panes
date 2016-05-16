;(function()
{
    'use strict';

    /**
     * @ngdoc function
     * @name <%= scriptAppName %>.decorator:<%= classedName %>
     * @description
     * # <%= classedName %>
     * Decorator of the <%= scriptAppName %>
     * Please note the service you are decorating must init before the app itself.
     * What that means is the $delegate object itself is the service your are trying to decoreate
     */
    angular.module('<%= scriptAppName %>').decorator('<%= cameledName %>' , function( $delegate )
    {


        return $delegate;
    });
}());
