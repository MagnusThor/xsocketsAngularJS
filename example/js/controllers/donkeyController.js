angular.module("myApp").controller("donkeyController", ["$scope", "chatService",
    function ($scope, chatService) {
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

    chatService.onopen = function () {
            chatService.messages.unshift({
                text: "Controller is opened/repoened",
                dt: new Date()
        });
        };
        chatService.onclose = function () {

        };




    $scope.closeController= function () {
        chatService.close();
    };
    $scope.closeConnection = function () {
        chatService.closeConnection();
    };
}]);