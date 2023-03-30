const express=require("express");
const {connection}=require("./config/db");
const {client}=require("./config/redis");
const {UserRoute}=require("./router/user.route");
const {Server}=require("socket.io");
const http=require("http");
const app=express();
app.use(express.json());
app.use("",UserRoute);


const server=http.createServer(app);
const wss=new Server(server);

wss.on("connection",()=>{
    console.log("connected");
})





server.listen(4300,async()=>{
    try{
        await connection;
        client;
        console.log("connected at 4300");
    }catch(err){
        console.log({"error":err.message});
    }
})