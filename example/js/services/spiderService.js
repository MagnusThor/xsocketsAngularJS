angular.module("myApp").service("spiderService",
[
    "spider", function (spider) {
        var self = this;
        this.messages = [];
       
        this.sendMessage = function(message) {
            spider.invoke("RegexInvokes",{
                message: message
            });
            // server will invoke
            // mamaSpider, papaSpider
        };

        spider.on(/spider/, function (message) {
            self.messages.push(message);
            console.log(self.messages);
        });
  

    }

]).factory("spider", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("test"); //  get test as spider
}]);
