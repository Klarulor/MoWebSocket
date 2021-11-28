"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyWebSocketServer = void 0;
var MyRequestMessage_1 = require("./features/MyRequestMessage");
var WebSocketServer = require('websocket').server;
var http = require('http');
var crypto = require("crypto");
var MyWebSocketServer = /** @class */ (function () {
    function MyWebSocketServer(port, ip) {
        this.server = http.createServer(function (request, response) {
            //console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        this.ip = ip;
        this.port = port;
    }
    MyWebSocketServer.prototype.listen = function (callback) {
        var _this = this;
        if (this.ip != undefined) {
            this.server.listen(this.port, this.ip, callback);
        }
        else
            this.server.listen(this.port, callback);
        //console.log(this.server, this.port)
        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            autoAcceptConnections: false
        });
        this.wsServer.on('request', function (req) { return _this.onRequest(req); });
        //callback();
    };
    MyWebSocketServer.prototype.auth = function (action) {
        this.authChecker = action;
    };
    MyWebSocketServer.prototype.onRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            var _this = this;
            return __generator(this, function (_a) {
                connection = request.accept('echo-protocol', request.origin);
                if (this.connections == undefined)
                    this.connections = [{ connection: connection, id: "=" + MyWebSocketServer.md5(Date.now().toString()) }];
                this.connections.push({ connection: connection, id: "=" + MyWebSocketServer.md5(Date.now().toString()) });
                //console.log()
                connection.on('message', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                    var message, k, key, k;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                message = msg.utf8Data;
                                if (!message.startsWith("auth=")) return [3 /*break*/, 3];
                                if (!(this.authChecker != undefined)) return [3 /*break*/, 2];
                                if (message.split("auth=")[1].split("\n").length == 0)
                                    return [2 /*return*/, connection.reject()];
                                for (k in this.connections) {
                                    if (this.connections[k].connection == connection)
                                        delete this.connections[k];
                                }
                                key = message.split("auth=")[1].split("\n")[1];
                                return [4 /*yield*/, this.authChecker(message.split("auth=")[1].split("\n")[0], key, request.remoteAddresses[0])];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                for (k in this.connections) {
                                    if (this.connections[k].connection == connection)
                                        this.connections[k].id = message.split('auth=')[1] + "=" + this.connections[k].id.split('=')[1];
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                if (this.connections.filter(function (x) { return x.connection == connection; })[0].id.split('=')[0] != "")
                                    this.onMessage({ connection: connection, id: this.connections.filter(function (x) { return x.connection == connection; })[0].id }, JSON.parse(message));
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                connection.on('close', function (reasonCode, description) {
                    for (var k in this.connections) {
                        if (this.connections[k] == connection)
                            delete this.connections[k];
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    MyWebSocketServer.prototype.subscribe = function (key, action) {
        if (this.subscribers == undefined)
            this.subscribers = [{ key: key, action: action }];
        else
            this.subscribers.push({ key: key, action: action });
    };
    MyWebSocketServer.prototype.onMessage = function (connection, message) {
        if (message.messageType == "req") {
            var filtered = this.subscribers.filter(function (x) { return x.key == message.key; });
            if (filtered.length > 0) {
                var reqMessage_1 = new MyRequestMessage_1.MyRequestMessage(this, message.content, connection.connection, connection.id, message.key, message.id);
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
    MyWebSocketServer.prototype._response = function (message, content) {
        //console.log(1)
        var responseMessage = {
            messageType: "res",
            content: content,
            id: message.id
        };
        message.connection.sendUTF(JSON.stringify(responseMessage));
    };
    MyWebSocketServer.prototype.get = function (client, key, content) {
        var _this = this;
        return new Promise(function (res) {
            var interval = setInterval(function () {
                if (_this.connections != undefined && _this.connections.filter(function (x) { return x.id.split('=')[0] == client.toString(); }).length > 0) {
                    clearInterval(interval);
                    var message = {
                        messageType: "req",
                        content: content,
                        id: MyWebSocketServer.md5(Date.now().toString()),
                        key: key
                    };
                    if (_this.reqMessages == undefined)
                        _this.reqMessages = [{ message: message, func: res }];
                    else
                        _this.reqMessages.push({ message: message, func: res });
                    //console.log(this.connections.map( x => x.id))
                    var con = _this.connections.filter(function (x) { return x.id.split("=")[0] == client; })[0];
                    con.connection.sendUTF(JSON.stringify(message));
                }
            });
        });
    };
    MyWebSocketServer.md5 = function (data) {
        return crypto.createHash('md5').update(data).digest("hex");
    };
    return MyWebSocketServer;
}());
exports.MyWebSocketServer = MyWebSocketServer;
