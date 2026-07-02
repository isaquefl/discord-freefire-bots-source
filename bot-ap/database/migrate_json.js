const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { tables } = require("./db");

const dbPath = path.join(__dirname, "apostado.db");

if (!fs.existsSync(dbPath)) {
  console.log("[MIGRATE] SQLITE DB (APOSTADO.DB) NÃO ENCONTRADO. CRIANDO ARQUIVOS JSON VAZIOS.");
  process.exit(0);
}

const sqlite = new Database(dbPath);

const tableNames = [
  "jogadores", "filas", "partidas", "mediadores", "mediadores_contas", 
  "fila_mediadores", "configuracoes", "permissoes", "itens_loja", 
  "inventario", "caixas", "caixas_itens", "eventos", "bo_analises", 
  "transacoes", "logs_partidas"
];

console.log("[MIGRATE] INICIANDO MIGRAÇÃO SQLITE -> JSON...");

for (const tableName of tableNames) {
  try {
    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
    console.log(`[MIGRATE] LENDO ${rows.length} REGISTROS DA TABELA ${tableName}...`);
    
    tables[tableName].data = [];
    
    for (const row of rows) {
      tables[tableName].data.push(row);
    }
    
    tables[tableName].save();
    console.log(`[MIGRATE] TABELA ${tableName} MIGRAÇÃO CONCLUÍDA COM SUCESSO.`);
  } catch (e) {
    if (e.message.includes("no such table")) {
      console.log(`[MIGRATE] TABELA ${tableName} NÃO EXISTE NO SQLITE. IGNORANDO.`);
    } else {
      console.error(`[MIGRATE] ERRO AO MIGRAR TABELA ${tableName}:`, e.message);
    }
  }
}

sqlite.close();
console.log("[MIGRATE] MIGRAÇÃO FINALIZADA.");
