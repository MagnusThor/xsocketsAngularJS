angular.module("myApp").controller("donkyController", ["$scope", "chatService", function ($scope, chatService) {
    $scope.message = {
        text: ""
    };
   
    $scope.messages = chatService.messages;
    $scope.sendMessage = function (event) {
        if (event === 13) {
            chatService.sendMessage($scope.message.text);
            $scope.message.text = "";
        }
    };

    $scope.close = function () {
        chatService.closeConnection();
    };
}]);