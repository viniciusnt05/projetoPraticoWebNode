const express = require("express");  // Importa o framework Express para gerenciar rotas e requisições HTTP
const bodyParser = require('body-parser');  // Importa o body-parser para lidar com dados enviados em formulários (corpo da requisição)
const app = express();  // Inicializa o servidor Express

// Conexão com o banco de dados e modelos
const connection = require('./database/database');  // Importa o arquivo de conexão com o banco de dados
const perguntaModel = require("./database/pergunta");  // Importa o modelo de perguntas
const respostaModel = require("./database/resposta");  // Importa o modelo de respostas

// Teste de conexão com o banco de dados
connection.authenticate()  // Tenta conectar ao banco de dados
    .then(() => {
        console.log("Connected");  // Exibe mensagem de sucesso se conectar
    })
    .catch(err => {
        console.log("Error connecting to the database:", err);  // Exibe erro caso não consiga conectar
    });

// Configurações do servidor Express
app.set('view engine', 'ejs');  // Define o EJS como motor de templates para renderizar views
app.use(bodyParser.urlencoded({ extended: false }));  // Configura o body-parser para lidar com formulários
app.use(bodyParser.json());  // Configura o body-parser para lidar com JSON
app.use(express.static('public'));  // Define o diretório "public" para servir arquivos estáticos (CSS, imagens, etc.)

// ----------------------------------------------------------------------------

// Rota principal ("/") que renderiza a página inicial
app.get('/', (req, res) => {
    res.render('index');  // Renderiza a view "index.ejs"
});

// Rota que lista todas as perguntas em ordem decrescente de criação
app.get('/indexPerguntas', (req, res) => {
    perguntaModel.findAll({ raw: true, order: [['id', 'DESC']] })  // Busca todas as perguntas
        .then(perguntas => {
            res.render('listar', {
                perguntas: perguntas  // Passa as perguntas para a view 'listar.ejs'
            });
        }).catch(err => {
        res.send("Error: " + err);  // Mostra erro, caso aconteça
    });
});

// Rota para exibir a página de criação de perguntas
app.get("/storePerguntas", (req, res) => {
    res.render('pergunta');  // Renderiza a view 'pergunta.ejs' para criar uma nova pergunta
});

// Rota para deletar uma pergunta com base no ID
app.post('/question/delete/:id', (req, res) => {
    const perguntaId = req.params.id;  // Obtém o ID da pergunta da URL

    perguntaModel.destroy({
        where: { id: perguntaId }  // Deleta a pergunta com o ID correspondente
    }).then(() => {
        res.redirect('/');  // Redireciona para a página inicial após a exclusão
    }).catch(err => {
        console.log("Erro ao apagar pergunta: " + err);  // Exibe mensagem de erro, se houver
        res.redirect('/');  // Redireciona para a página inicial
    });
});

// Rota para salvar uma nova pergunta
app.post("/salvarQuestao", (req, res) => {
    const { titule, description } = req.body;  // Extrai o título e a descrição do corpo da requisição (formulário)

    perguntaModel.create({
        titulo: titule,  // Cria uma nova pergunta no banco
        descricao: description
    }).then(() => {
        res.redirect('indexPerguntas');  // Redireciona para a lista de perguntas após criar
    }).catch(err => {
        res.send("Error: " + err);  // Mostra erro se houver
    });
});

// Rota para visualizar as respostas de uma pergunta específica
app.get('/respostas/:id', (req, res) => {
    const perguntaId = req.params.id;  // Obtém o ID da pergunta da URL
    perguntaModel.findByPk(perguntaId).then(pergunta => {  // Busca a pergunta pelo ID (Primary Key)
        if (pergunta != undefined) {
            respostaModel.findAll({
                where: { perguntaId: perguntaId }  // Busca todas as respostas da pergunta
            }).then(respostas => {
                res.render('lerResposta', {  // Renderiza a página com as respostas
                    pergunta: pergunta,  // Passa a pergunta e as respostas para a view
                    respostas: respostas
                });
            });
        } else {
            res.redirect('/');  // Redireciona para a página inicial se a pergunta não for encontrada
        }
    });
});

// Rota para salvar uma nova resposta para uma pergunta
app.post('/responder', (req, res) => {
    var corpo = req.body.corpo;  // Conteúdo da resposta
    var perguntaId = req.body.pergunta;  // ID da pergunta respondida

    respostaModel.create({
        corpo: corpo,  // Cria uma nova resposta no banco de dados
        perguntaId: perguntaId
    }).then(() => {
        res.redirect('/respostas/' + perguntaId);  // Redireciona para a página da pergunta após responder
    }).catch((err) => {
        console.log("Erro ao criar resposta: " + err);  // Exibe erro se houver
        res.redirect('/');  // Redireciona para a página inicial em caso de erro
    });
});

// Rota para renderizar a página de responder a uma pergunta
app.get('/responder/:id', (req, res) => {
    const perguntaId = req.params.id;  // Obtém o ID da pergunta da URL

    perguntaModel.findByPk(perguntaId).then(pergunta => {
        if (pergunta != undefined) {
            respostaModel.findAll({
                where: { perguntaId: perguntaId }  // Busca todas as respostas da pergunta
            }).then(respostas => {
                res.render('responder', {  // Renderiza a view 'responder.ejs' com a pergunta e as respostas
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        } else {
            res.redirect('/');  // Redireciona para a página inicial se a pergunta não for encontrada
        }
    });
});

// Rota para deletar uma resposta específica
app.post('/resposta/delete/:id', (req, res) => {
    const respostaId = req.params.id;  // Obtém o ID da resposta da URL

    respostaModel.destroy({
        where: { id: respostaId }  // Deleta a resposta com o ID correspondente
    }).then(() => {
        res.redirect('back');  // Redireciona para a página anterior
    }).catch(err => {
        console.log("Erro ao apagar resposta: " + err);  // Exibe erro se houver
        res.redirect('back');  // Redireciona para a página anterior
    });
});

// Rota para deletar todas as respostas de uma pergunta
app.post('/respostas/deleteall/:id', (req, res) => {
    const perguntaId = req.params.id;  // Obtém o ID da pergunta da URL

    respostaModel.destroy({
        where: { perguntaId: perguntaId }  // Deleta todas as respostas da pergunta
    }).then(() => {
        res.redirect('back');  // Redireciona para a página anterior
    }).catch(err => {
        console.log("Erro ao apagar todas as respostas: " + err);  // Exibe erro se houver
        res.redirect('back');  // Redireciona para a página anterior
    });
});

// Inicia o servidor na porta 3000
app.listen(3000, (err) => {
    if (err) {
        console.log("Erro ao iniciar servidor");  // Exibe erro se não conseguir iniciar
    } else {
        console.log("Servidor iniciado na porta 3000...");  // Exibe mensagem de sucesso ao iniciar
    }
});


/*
* ANOTAÇÕES
* Express => Manuseio de requisições de respostas
* Nodemon => Monitoramento automático das rotas (edição de código)
* EJS => Motor de template = uso dos parâmetros dentro do HTML
* Bootstrap => Componentes de interfaces prontos para auxiliar no front-end
*   class= container, form-control, btn btn-success, btn-danger, card, card-header, card-body
* Body-Parser => Capturar dados de formulário
*
* Params =>
*   query => rota (/user/cpf?value=teste) => value seria o valor a ser acessado pela query
*   body => enviado do HTML
*   params => acessa o dado passado direto na rota
*/