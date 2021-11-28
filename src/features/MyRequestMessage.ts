export class MyRequestMessage{
    public content: string;
    public connection: any;
    public connectionId: string;
    public key: string;
    public id: string;
    public _ctr: any;
    constructor(ctr, content, connection, connectionId, key, id){
        this.content = content;
        this.connection = connection;
        this.connectionId = connectionId;
        this.key = key;
        this.id = id;
        this._ctr = ctr;
    }
    public res(content: string): void{
        this._ctr._response(this, content);
    }
}