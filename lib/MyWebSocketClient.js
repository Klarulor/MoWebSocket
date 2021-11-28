"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWebSocketClient = void 0;
var MyRequestMessage_1 = require("./features/MyRequestMessage");
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var crypto = require("crypto");
var MyWebSocketClient = /** @class */ (function () {
    function MyWebSocketClient(name, address) {
        this.name = name;
        this.address = address;
    }
    MyWebSocketClient.prototype.OnClose = function (func) {
    };
    MyWebSocketClient.prototype.connect = function (callback) {
        var instance = this;
        //console.log(instance.address)
        client.connect("ws://".concat(instance.address, "/"), 'echo-protocol');
        client.on('connect', function (connection) {
            callback();
            connection.sendUTF("auth=" + instance.name);
            //console.log('WebSocket Client Connected');
            instance.connection = connection;
            connection.on('error', function (error) {
                //console.log("Connection Error: " + error.toString());
            });
            connection.on('close', function () {
                if (instance.funcOnClose != undefined)
                    instance.funcOnClose();
            });
            connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    instance.onMessage(JSON.parse(message.utf8Data));
                }
            });
        });
    };
    MyWebSocketClient.prototype.subscribe = function (key, action) {
        if (this.subscribers == undefined)
            this.subscribers = [{ key: key, action: action }];
        else
            this.subscribers.push({ key: key, action: action });
    };
    MyWebSocketClient.prototype.onMessage = function (message) {
        if (message.messageType == "req") {
            var filtered = this.subscribers.filter(function (x) { return x.key == message.key; });
            if (filtered.length > 0) {
                var reqMessage_1 = new MyRequestMessage_1.MyRequestMessage(this, message.content, undefined, undefined, message.key, message.id);
                filtered.forEach(function (x) { return x.action(reqMessage_1); });
            }
        }
        else if (message.messageType == "res") {
            var msgs = this.reqMessages.filter(function (x) { return x.message.id == message.id; });
            if (msgs.length > 0) {
                var msg = msgs[0];
                msg.func(message.content);
            }
        }
    };
    MyWebSocketClient.prototype._response = function (message, content) {
        var responseMessage = {
            messageType: "res",
            content: content,
            id: message.id
        };
        //console.log(1)
        this.connection.sendUTF(JSON.stringify(responseMessage));
    };
    MyWebSocketClient.prototype.get = function (key, content) {
        var _this = this;
        return new Promise(function (res) {
            var interval = setInterval(function () {
                if (_this.connection != null) {
                    clearInterval(interval);
                    var message = {
                        messageType: "req",
                        content: content,
                        id: MyWebSocketClient.md5(Date.now().toString()),
                        key: key
                    };
                    if (_this.reqMessages == undefined)
                        _this.reqMessages = [{ message: message, func: res }];
                    else
                        _this.reqMessages.push({ message: message, func: res });
                    //console.log(this)
                    _this.connection.sendUTF(JSON.stringify(message));
                    //console.log("ye")
                }
            }, 50);
        });
    };
    MyWebSocketClient.md5 = function (data) {
        return crypto.createHash('md5').update(data).digest("hex");
    };
    return MyWebSocketClient;
}());
exports.MyWebSocketClient = MyWebSocketClient;
