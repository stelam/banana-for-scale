angular.module('converter.directives', [])

/**
 * Provide custom type validation for input elements. Certain type attributes
 * don't work consistenty cross-browser, so this is a required workaround.
 * Looking at you, webkit and `type="number"`.
 *
 * ```html
 * <input
 *   ng-model=""
 *   app-type="">
 * ```
 */
.directive('appType', function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      // Custom number validation logic.
      if (attrs.appType === 'number') {
        return ctrl.$parsers.push(function (value) {
          var valid = value == null || isFinite(value);

          ctrl.$setValidity('number', valid);

          return valid && value != null ? Number(value) : undefined;
        });
      }
    }
  };
});