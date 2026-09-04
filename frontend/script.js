const WS = new WebSocket(`ws://${location.host}`);

const mensagem = document.querySelector("#msm");

const main = document.querySelector("main")

const usuario = {
  id: null
}

const form = document.querySelector("#form")

function addMsM(e){
  const p = document.createElement("p");
  p.classList.add(e.class)
  p.innerText = e.mensagem 
  main.appendChild(p)
}

WS.onmessage =(e)=>{
  const data = JSON.parse(e.data);

  switch(data.header){
    case "id do usuario":
      usuario.id = data.body.id
      break

    case "mensagem recebida":
      addMsM(data.body)
  }
}

form.addEventListener("submit",(e)=>{
  e.preventDefault()

  if(usuario.id === null) return;
  
  WS.send(JSON.stringify({
    header: "mensagem enviada",
    body: {
      id: usuario.id,
      mensagem: mensagem.value
    }
  }))
  mensagem.value = ""
})