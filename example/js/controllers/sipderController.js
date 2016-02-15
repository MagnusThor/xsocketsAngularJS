(function (angular) {
    var spiderController = function ($scope, spiderService) {
        var spider = this;
        spider.messages = spiderService.messages;
        spider.message = {
            text: ""
        };
        spider.sendMessage = function (event) {
            if (event === 13) {
                spiderService.sendMessage(spider.message.text);
                spider.message.text = "";
            }
        };
    };
    angular.module("myApp").controller("spiderController",
        [
        "$scope", "spiderService",
        spiderController
    ]);
}(angular));
