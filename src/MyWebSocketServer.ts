import { MyRequestMessage } from "./features/MyRequestMessage";
import { IMyMessage } from "./interfaces/IMyMessage";
import { IMyResponse } from "./interfaces/IMyResponse";

var WebSocketServer = require('websocket').server;
var http = require('http');
const crypto = require(`crypto`);
export class MyWebSocketServer {
    public port: number;
    public ip?: string;
    private server = http.createServer(function (request, response) {
        //console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    private wsServer: any;
    constructor(port: number, ip?: string) {
        this.ip = ip;
        this.port = port;
    }
    public listen(callback: any) {
        if (this.ip != undefined) {
            this.server.listen(this.port, this.ip, callback);
        } else
            this.server.listen(this.port, callback);
            //console.log(this.server, this.port)
        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            autoAcceptConnections: false
        });

        this.wsServer.on('request', req => this.onRequest(req));
        //callback();
    }
    public auth(action: (name, key, ip) => boolean): void{
        this.authChecker = action;
    }
    private authChecker: (name, authKey, ip) => boolean;
    private connections: [{ connection: any, id: string }];
    private async onRequest(request) {
        console.log(request)
        var connection = request.accept();
        if(this.connections == undefined) this.connections = [{connection, id: "="+MyWebSocketServer.md5(Date.now().toString())}]
        this.connections.push({connection, id: "="+MyWebSocketServer.md5(Date.now().toString())})
        //console.log()
        connection.on('message', async msg => {
            console.log(msg)
            let message: string = msg.utf8Data;
            console.log("message",message)
            if(msg.utf8Data != undefined && message.startsWith("auth=")){
                if(this.authChecker != undefined){
                    if(message.split("auth=")[1].split("\n").length == 0) return connection.reject();
                    for(let k in this.connections){
                        if(this.connections[k].connection == connection)
                            delete this.connections[k];
                    }
                    let key = message.split("auth=")[1].split("key=").at(1);
                    await this.authChecker(message.split("auth=")[1], key, request.remoteAddresses[0]);
                }
                for(let k in this.connections){
                    if(this.connections[k].connection == connection)
                        this.connections[k].id = message.split('auth=')[1]+"="+this.connections[k].id.split('=')[1];
                }
            }else{
                if(this.connections.filter(x => x.connection == connection)[0].id.split('=')[0] != "")
                this.onMessage({ connection, id: this.connections.filter(x => x.connection == connection)[0].id}, JSON.parse(message) as IMyMessage)
            }
        });
        connection.on('close', function (reasonCode, description) {
            for(let k in this.connections){
                if(this.connections[k] == connection)
                    delete this.connections[k];
            }
        });
    }
    private subscribers: [{key: string, action: any}]
    public subscribe(key: string, action: (message: MyRequestMessage) => void): void{
        if(this.subscribers == undefined) this.subscribers = [{key, action}]
        else this.subscribers.push({key, action});
    }
    private reqMessages: [{message: IMyMessage, func: any}]
    private onMessage(connection: { connection, id: string }, message: IMyMessage){
        console.log("suka blyat", message)
        if(message.messageType == "req" || message.messageType == 0){
            console.log("subscribers:",this.subscribers)
            let filtered = this.subscribers.filter(x => x.key == message.key);
            if(filtered.length > 0){
                let reqMessage: MyRequestMessage = new MyRequestMessage(this, message.content, connection.connection, connection.id, message.key, message.id);
                filtered.forEach(x => x.action(reqMessage))
            }
        }else if(message.messageType == "res"|| message.messageType == 1){
            let msgs = this.reqMessages.filter(x => x.message.id == message.id);
            if(msgs.length > 0){
                let msg = msgs[0];
                msg.func({success: true, content: message.content});
            }
        }else if(message.messageType == "send" || message.messageType == 2){
            let filtered = this.subscribers.filter(x => x.key == message.key);
            if(filtered.length > 0){
                let reqMessage: MyRequestMessage = new MyRequestMessage(this, message.content, connection.connection, connection.id, message.key, message.id, true);
                filtered.forEach(x => x.action(reqMessage))
            }
        }
    }
    public _response(message: MyRequestMessage, content: string){
        //console.log(1)
        let responseMessage: IMyMessage = 
        {
            messageType: "res",
            content,
            id: message.id
        };
        message.connection.sendUTF(JSON.stringify(responseMessage));
    }
    public get<T>(client: T | string, key: string, content: string): Promise<IMyResponse> {
        return new Promise(res => {
            setTimeout(x => res({success: false, error: "Timeout"}), 500);
            let interval = setInterval(() => {
                if(this.connections != undefined && this.connections.filter(x => x.id.split('=')[0] == client.toString()).length > 0){
                    clearInterval(interval);
                    let message: IMyMessage = {
                        messageType: "req",
                        content,
                        id: MyWebSocketServer.md5(Date.now().toString()),
                        key
                    }
                    if(this.reqMessages == undefined) this.reqMessages = [{message, func: res}]
                    else this.reqMessages.push({message, func: res});
                    //console.log(this.connections.map( x => x.id))
                    let con = this.connections.filter(x => x.id.split("=")[0] == client)[0];
                    con.connection.sendUTF(JSON.stringify(message));
                }
            }, 100)
        });
    }
    private static md5(data: string): string {
        return crypto.createHash('md5').update(data).digest("hex");
    }
}