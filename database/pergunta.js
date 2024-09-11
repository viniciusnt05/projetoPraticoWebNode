const Sequelize = require('sequelize');  // Importa o Sequelize, que é um ORM para trabalhar com bancos de dados
const connection = require('./database');  // Importa a conexão com o banco de dados, já configurada no arquivo 'database.js'

// Define o modelo de 'pergunta' no banco de dados
const pergunta = connection.define('pergunta', {
    // Define o campo 'titulo' da tabela 'pergunta'
    titulo: {
        type: Sequelize.STRING,  // O tipo do campo é STRING (texto curto)
        allowNull: false  // Não permite valores nulos, o título deve ser sempre preenchido
    },
    // Define o campo 'descricao' da tabela 'pergunta'
    descricao: {
        type: Sequelize.TEXT,  // O tipo do campo é TEXT (texto longo)
        allowNull: false  // Não permite valores nulos, a descrição deve ser sempre preenchida
    }
});

// Cria a tabela 'pergunta' no banco de dados, se ainda não existir
pergunta.sync({ force: false }).then(() => {
    console.log("Tabela de perguntas criada");  // Exibe uma mensagem no console após a criação da tabela
});

// Exporta o modelo de 'pergunta' para ser utilizado em outras partes do projeto
module.exports = pergunta;
