// bibliotecas
const express = require('express');
const mysql = require('mysql2');
const cron = require('node-cron');

//rotas e servidor
const app = express();

// configurar banco de dados mysql db1 e db2
const db1 = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'Zalman@550',
    database: 'db1'
});

const db2 =mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'Zalman@550',
    database: 'db2'
});

// conectar aos bd
db1.connect( err => {
    if (err) throw err;
    console.log('conectado ao banco de dados db1')});

db2.connect ( err => {
    if (err) throw err;
    console.log('conectado ao banco de dados db2')
});

// criacao das tabelas se nao existirem
db1.query('CREATE TABLE IF NOT EXISTS tabela1 (id INT PRIMARY KEY, nome VARCHAR(255))', (err) => {
    if (err) throw err;
  console.log('Tabela tabela1 criada ou já existe');
});
db2.query('CREATE TABLE IF NOT EXISTS tabela2 (id INT PRIMARY KEY, nome VARCHAR(255))', (err) => {
    if (err) throw err;
  console.log('Tabela tabela2 criada ou já existe');
});

// função para copiar dados
const copiarDados = (nomeTabela1, nomeTabela2) => {
    // obter todas as colunas de tabela1 usando DESCRIBE
    db1.query(`DESCRIBE ${nomeTabela1}`, (err, columns) => {
        if (err) {
            console.error('Erro ao obter informações da tabela:', err);
            return;
        }

        // Processar colunas para criar consultas de inserção e atualização
        const colunas = columns.map(col => col.Field).join(', '); // nomes das colunas
        const placeholders = columns.map(() => '?').join(', '); // criar placeholders "?" para as colunas
        const updatePlaceholders = columns.map(col => `${col.Field} = VALUES(${col.Field})`).join(', '); // Atualizações em caso de duplicidade

        // buscar dados da tabela1
        db1.query(`SELECT * FROM ${nomeTabela1}`, (err, rows) => {
            if (err) {
                console.error('Erro ao buscar dados:', err);
                return;
            }

            rows.forEach((row) => {
                // Obter valores das colunas para os placeholders
                const values = columns.map(col => row[col.Field]); // valores das colunas
                
                // Inserir ou atualizar dados na tabela2
                db2.query(
                    `INSERT INTO ${nomeTabela2} (${colunas}) VALUES (${placeholders})
                    ON DUPLICATE KEY UPDATE ${updatePlaceholders}`, // Atualizar se a chave primária já existir
                    values, // valores para os placeholders
                    (err) => {
                        if (err) {
                            console.error('Erro ao inserir ou atualizar dados:', err);
                        } else {
                            console.log(`Dados copiados: ${row.id}`);
                        }
                    }
                );
            });
        });
    });
};

//agendar cron job para rodar a cada minuto
cron.schedule('* * * * *', () => {
    console.log('Executando cron job...');
    copiarDados('tabela1', 'tabela2');
});

//servidor basico
app.get('/', (req, res) => {
    res.send('cron job rodando!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});