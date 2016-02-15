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
            //todo: fix relative path..
             templateUrl: "app/directives/templates/realtimeDirective.html"
         };
     }
]).factory("rtc", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic"); // Get "generic" as "rtc" ,
}
]);