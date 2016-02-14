// 'bar' is provided using the "config" of myApp
angular.module("myApp").service('chatService', ["xsocketsController", function (xsocketsController) {
    var bar = xsocketsController("test");
    bar.invoke("chatmessage", {
        text: "Just call invoke.. directly", dt: new Date()

    });

    bar.onopen = function () {
        console.log("onopen %s", new Date());
    };

    var self = this;

    this.messages = [];

    bar.on("chatmessage", function (data) {
        self.messages.unshift(data);
    });

    bar.onclose = function (evt) {
        self.messages.unshift({
            text: "onClose recieved",
            dt: new Date()
        }); // just display to the user...
        if (self.onclose) self.onclose(evt);
    };
    bar.onopen = function (evt) {
        if (self.onopen) self.onopen(evt);
    };

    this.close = function () {
        bar.close();
    };

    this.onopen = undefined;
    this.onclose = undefined;

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