import { MyWebSocketClient } from "../MyWebSocketClient";

let client: MyWebSocketClient = new MyWebSocketClient("test", "localhost:8002");
client.connect(() => console.log("success"));
test()
async function test(): Promise<void>{
    let data = await client.get("key", "some content");
    console.log(data);
}