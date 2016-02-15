angular.module("myApp").directive("realtimeDirective", ["rtc",
     function (rtc) {
         return {
             restrict: 'E',
             link: function ($scope) {
                 $scope.message = "";
                 $scope.messages = [];
                 rtc.on("foo", function (message) {
                     $scope.messages.push(message);
                 });
                 $scope.sendMessage = function () {
                     rtc.invoke("foo", {
                         text: $scope.message,
                         dt: new Date()
                     });
                 }
             },
             templateUrl: "directives/templates/realtimeDirective.html"
         };
     }
]).factory("rtc", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic");
}
]);