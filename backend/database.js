const {DatabaseSync} = require("node:sqlite");

const bank = new DatabaseSync("./backend/bank.db");

function select(pathname,method){
  const comando = bank.prepare(`
     SELECT * FROM rotas WHERE rota = ? AND metodo = ?
  `)

  return comando.get(pathname,method)
}

module.exports = {
  select
}
