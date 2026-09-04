// protocolos
const HTTP = require("http");
const WS = require("ws");

// libs
const CRYPTO = require("crypto");

// sistema de arquivos
const FS = require("fs");

// configs da porta
const HOST = "0.0.0";
const PORT = 3000;

// banco
const DATABASE = require("./database.js");

// usuarios
let usuários = new Map;

// server/HTTP
const server = HTTP.createServer((req,res)=>{
  let url = new URL(req.url,`http://${HOST}:${PORT}`);

  const data = {
    url: req.url,
    pathname: url.pathname,
    headers:req.headers,
    method: req.method,
    body: ""
  };

  const body = [];

  req.on("data",chunk=>{
    body.push(chunk)
  });

  req.on("end",()=>{
    data.body = String(Buffer.concat(body))

    const rotaExiste = DATABASE.select(data.pathname,data.method)

    switch(rotaExiste){
      case undefined:
        res.writeHead(401,{
          "Content-type":"text/plain"
        })

        res.end("rota não autorizada ou arquivo não encontrado.")
        break

      default:
        FS.readFile(rotaExiste.arquivo,(err,arq)=>{
          if(err){
            res.writeHead(500,{
              "Content-type":"text/plain"
            })

            res.end("erro ao ler o arquivo.")
            return
          }

          res.writeHead(200,{
            "Content-type":rotaExiste.tipo
          })

          res.end(arq)
        })
        break
    }
    
  })
})

// server/Websocket
const websocket = new WS.WebSocketServer({
  server:server
})

websocket.on("connection",socket=>{
  const id = CRYPTO.randomUUID();

  usuários.set(id,{
    id: id,
    socket: socket
  });

  socket.send(JSON.stringify({
    header: "id do usuario",
    body:{
      id: id
    }
  }));

  socket.on("message",(msm)=>{
    const data = JSON.parse(String(msm));

    switch(data.header){
      case "mensagem enviada":
        for(let u of usuários.values()){
          if(u.socket !== socket){
            u.socket.send(JSON.stringify({
              header: "mensagem recebida",
              body: {
                class: "youMSM",
                mensagem: data.body.mensagem
              }
            }))
          }

          else{
            socket.send(JSON.stringify({
              header: "mensagem recebida",
              body: {
                class: "myMSM",
                mensagem: data.body.mensagem
              }
            }))
          }
        }
    }
  })

  socket.on("close",()=>{
    usuários.delete(id);

    console.log(`usuario: ${id}, desconectou!`)
  })
})

// porta
server.listen(PORT,HOST,()=>{
  console.log(`servidor em http://${HOST}:${PORT}`)
})