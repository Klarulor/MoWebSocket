import { MyWebSocketClient } from "../MyWebSocketClient";

let client: MyWebSocketClient = new MyWebSocketClient("test", "localhost:7201");
client.connect(() => console.log("success"));
setTimeout(test, 500)
async function test(): Promise<void>{
    let data = await client.get("req", JSON.stringify({raw: true, query: "SELECT * FROM discord_users"}));
    console.log(JSON.parse(data.content)[0]);
}