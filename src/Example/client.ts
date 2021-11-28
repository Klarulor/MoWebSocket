import { MyWebSocketClient } from "../MyWebSocketClient";

let client: MyWebSocketClient = new MyWebSocketClient("test", "localhost:8002");
client.connect(() => console.log("success"));
q()
async function q(): Promise<void>{
    let data = await client.get("test", "8002");
    console.log(data);
}