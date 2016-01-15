angular.module("myApp").service('myService', ["bar", function (bar) {
    var self = this;
    this.messages = [];
    bar.on("chatmessage", function (data) {
        self.messages.unshift(data);
    });
    this.sendMessage = function (message) {
        bar.invoke("chatmessage", {
            text: message, dt: new Date()
        });
    };
}]);