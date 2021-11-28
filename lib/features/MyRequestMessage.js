"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRequestMessage = void 0;
var MyRequestMessage = /** @class */ (function () {
    function MyRequestMessage(ctr, content, connection, connectionId, key, id) {
        this.content = content;
        this.connection = connection;
        this.connectionId = connectionId;
        this.key = key;
        this.id = id;
        this._ctr = ctr;
    }
    MyRequestMessage.prototype.res = function (content) {
        this._ctr._response(this, content);
    };
    return MyRequestMessage;
}());
exports.MyRequestMessage = MyRequestMessage;
