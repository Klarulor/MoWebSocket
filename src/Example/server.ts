import { MyWebSocketServer } from "../MyWebSocketServer";

let server: MyWebSocketServer = new MyWebSocketServer(7003);
server.listen(() => console.log("success"));
server.subscribe("q", message => {
    console.log(message.content);
    message.res("hey");
})


q();
async function q() {
    let data = await server.get("test", "b", "idk")
    console.log(data)
}