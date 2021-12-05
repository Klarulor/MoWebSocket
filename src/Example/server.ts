import { MyWebSocketServer } from "../MyWebSocketServer";

let server: MyWebSocketServer = new MyWebSocketServer(7002);
server.listen(() => console.log("success"));
server.subscribe("test2", message => {
    console.log(message.content, "URAAAA");
    message.res("hey");
})


// setInterval(q, 2500)
// async function q() {
//     let data = await server.get("test", "s", "idk")
//     console.log(data)
// }