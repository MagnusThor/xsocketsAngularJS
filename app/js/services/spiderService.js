angular.module("myApp").service("spiderService",
[
    "spider", function (spider) {
        var self = this;
        this.messages = [];
        var randomString = function() {
            return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        };
        this.sendMessage = function (message) {
            spider.invoke("redSpider",{
                message: message,
                sender: randomString() + "spider"
            });
            spider.invoke("blueSpider", {
                message: message,
                sender: randomString() +  "spider"
            });
            // this is just to illustrate i use a random string,
            spider.invoke("mytopic", {
                message: message,
                sender: "mytopic"
            });
        };

        spider.on(/spider/, function (message) {
            self.messages.unshift(message);
        });
        spider.on(/mytopic/, function (message) {
            self.messages.unshift(message);

        });
    }

]).factory("spider", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic"); //  get generic as spider
}]);
