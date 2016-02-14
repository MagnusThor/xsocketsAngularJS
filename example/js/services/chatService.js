// 'bar' is provided using the "config" of myApp
angular.module("myApp").service('chatService', ["xsocketsController", function (xsocketsController) {

  
    var bar = xsocketsController("test");

    bar.onopen = function() {
        console.log("onopen %s",new Date());
    };

    var self = this;

    this.messages = [];

   

    bar.on("chatmessage", function (data) {
        self.messages.unshift(data);
    });

    bar.onclose = function () {
        console.log("controller closed");
    }


    this.sendMessage = function (message) {
        bar.invoke("chatmessage", {
            text: message, dt: new Date()
        });
    };
    this.closeConnection = function () {
        bar.kill();
        console.log("closeConnection %s", new Date());
        bar.invoke("chatmessage", {
            text: "Publish after kill?", dt: new Date()
        });
    };
}]);