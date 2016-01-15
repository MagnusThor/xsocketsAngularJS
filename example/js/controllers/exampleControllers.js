angular.module("myApp").controller("donkyController", ["$scope", "foo", function ($scope, rtc) {
    $scope.message = {
        text: ""
    };
    $scope.messages = [];
    rtc.onopen = function (ci) {
        console.log("donkyController rtc open", ci)
    };

    rtc.on("chatmessage", function (data) {
        $scope.messages.unshift(data);
    });
    $scope.sendMessage = function (event) {
        if (event === 13) {
            rtc.invoke("chatmessage", {
                text: $scope.message.text, dt: new Date()
            });
            $scope.message.text = "";
        }
    };
}]).factory("foo", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic");
}]);





angular.module("myApp").controller("monkyController", ["$scope", "myService", function ($scope, rtc) {
    $scope.message = {
        text: ""
    };
    $scope.messages = rtc.messages;
    $scope.sendMessage = function (event) {
        if (event === 13) {
            rtc.sendMessage($scope.message.text);
            $scope.message.text = "";
        }
       
    };
}]);
