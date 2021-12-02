import { MyRequestMessage } from "./features/MyRequestMessage";
import { IMyMessage } from "./interfaces/IMyMessage";
import { IMyResponse } from "./interfaces/IMyResponse";

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
const crypto = require(`crypto`);
export class MyWebSocketClient{
    public address: string;
    public name: string;
    public autoReconnect: boolean = false;
    constructor(name: string, address: string, autoReconnect: boolean = false){
        this.name = name;
        this.address = address;
        this.autoReconnect = autoReconnect;
    }
    public funcOnClose: any;
    public OnClose(func: any){

    }
    public connection: any;
    public connect(callback: any): void{
        let instance: MyWebSocketClient = this;
        //console.log(instance.address)
        client.connect(`ws://${instance.address}/`, 'echo-protocol');
        client.on('connect', function(connection) {
            callback();
            connection.sendUTF("auth="+instance.name);
            //console.log('WebSocket Client Connected');
            instance.connection = connection;
            connection.on('error', function(error) {
                //console.log("Connection Error: " + error.toString());
            });
            connection.on('close', function() {
                if(instance.autoReconnect){
                    setTimeout(() => {
                        instance.connect(callback);
                    }, 100);
                }
                if(instance.funcOnClose != undefined) instance.funcOnClose();
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    instance.onMessage(JSON.parse(message.utf8Data));
                }
            });
        });
        
    }
    public subscribers: [{key: string, action: any}];
    public subscribe(key: string, action: (message: MyRequestMessage) => void): void{
        if(this.subscribers == undefined) this.subscribers = [{key, action}]
        else this.subscribers.push({key, action});
    }
    public reqMessages: [{message: IMyMessage, func: any}];
    public onMessage(message: IMyMessage){
        if(message.messageType == "req"){
            let filtered = this.subscribers.filter(x => x.key == message.key);
            if(filtered.length > 0){
                let reqMessage: MyRequestMessage = new MyRequestMessage(this, message.content, undefined, undefined, message.key, message.id);
                filtered.forEach(x => x.action(reqMessage))
            }
        }else if(message.messageType == "res"){
            let msgs = this.reqMessages.filter(x => x.message.id == message.id);
            if(msgs.length > 0){
                let msg = msgs[0];
                msg.func({success: true, content: message.content});
            }
        }else if(message.messageType == "send"){
            let filtered = this.subscribers.filter(x => x.key == message.key);
            if(filtered.length > 0){
                let reqMessage: MyRequestMessage = new MyRequestMessage(this, message.content, undefined, undefined, message.key, message.id, true);
                filtered.forEach(x => x.action(reqMessage))
            }
        }
    }
    public _response(message: MyRequestMessage, content: string){
        let responseMessage: IMyMessage = 
        {
            messageType: "res",
            content,
            id: message.id
        };
        //console.log(1)
        this.connection.sendUTF(JSON.stringify(responseMessage));
    }
    public get(key: string, content: string): Promise<IMyResponse> {
        return new Promise(res => {
            setTimeout(x => res({success: false, error: "Timeout"}), 500);
            let interval = setInterval(() => {
                if(this.connection != null){
                    clearInterval(interval);
                    let message: IMyMessage = {
                        messageType: "req",
                        content,
                        id: MyWebSocketClient.md5(Date.now().toString()),
                        key
                    }
                    if(this.reqMessages == undefined) this.reqMessages = [{message, func: res}]
                    else this.reqMessages.push({message, func: res});
                    //console.log(this)
                    this.connection.sendUTF(JSON.stringify(message));
                    
                    //console.log("ye")
                }
            }, 50)
        });
    }
    public static md5(data: string): string {
        return crypto.createHash('md5').update(data).digest("hex");
    }
}




