import { MyWebSocketClient } from "../MyWebSocketClient";

let client: MyWebSocketClient = new MyWebSocketClient("test", "localhost:7003");
client.connect(() => console.log("success"));
q()
async function q(): Promise<void>{
    let data = await client.get("q", "arara");
    console.log(data);
}
client.subscribe("b", message => message.res("da"));