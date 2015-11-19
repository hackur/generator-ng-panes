/**
 * spec file for component <%= name %>
 */
 'use strict';

 describe('Directive: <%= cameledName %>', function ()
 {

     // load the directive's module
     beforeEach(module('<%= scriptAppName %>'));

     var element,
         scope;

     beforeEach(inject(function ($rootScope)
     {
         scope = $rootScope.$new();
     }));

     it('should make hidden element visible', inject(function ($compile)
     {
         element = angular.element('<<%= dasherizeName %>></<%= dasherizeName %>>');
         element = $compile(element)(scope);
         expect(element.text()).toBe('this is the <%= cameledName %> component');
     }));
 });
