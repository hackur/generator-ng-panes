(function()
{
    'use strict';

    /**
     * @ngdoc service
     * @name <%= scriptAppName %>.<%= cameledName %>
     * @description
     * # <%= cameledName %>
     * Provider in the <%= scriptAppName %>.
     */
    angular.module('<%= scriptAppName %>').provider('<%= cameledName %>', [function ()
    {
        // Private variables
        var salutation = 'Hello';

        // Private constructor
        var Greeter = function()
        {
            this.greet = function ()
            {
                return salutation;
            };
        }

        // Public API for configuration
        this.setSalutation = function (s)
        {
            salutation = s;
        };

        // Method for instantiating
        this.$get = function ()
        {
            return new Greeter();
        };

    }]);

}());
