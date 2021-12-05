# MoWebSocket

A wrapper over a web socket.

**Server:**
```js
import { MyWebSocketServer } from "mowebsocket";

let server: MyWebSocketServer = new MyWebSocketServer(7002);
server.listen(() => console.log("success"));
server.subscribe("key", message => {
    console.log(message.content, ": response");
    message.res("success");
})
```

**Client:**
```ts
import { MyWebSocketClient } from "mowebsocket";

let client: MyWebSocketClient = new MyWebSocketClient("test", "localhost:8002");
client.connect(() => console.log("success"));
test()
async function test(): Promise<void>{
    let data = await client.get("key", "some content");
    console.log(data);
}
```
