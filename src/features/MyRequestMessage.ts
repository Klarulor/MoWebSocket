export class MyRequestMessage{
    public content: string;
    public connection: any;
    public connectionId: string;
    public key: string;
    public id: string;
    public _ctr: any;
    public isSend: boolean;
    constructor(ctr, content, connection, connectionId, key, id, isSend = false){
        this.content = content;
        this.connection = connection;
        this.connectionId = connectionId;
        this.key = key;
        this.id = id;
        this._ctr = ctr;
        this.isSend = isSend;
    }
    public res(content: string): void{
        if(!this.isSend)
            this._ctr._response(this, content);
    }
}