const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const connection = require('./database/database');
const perguntaModel = require("./database/pergunta");
const respostaModel = require("./database/resposta");

connection.authenticate()
    .then(() => {
        console.log("Connected");
    })
    .catch(err => {
        console.log("Error connecting to the database:", err);
    });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// ----------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/indexPerguntas', (req, res) => {
    perguntaModel.findAll({ raw: true, order: [['id', 'DESC']] })
        .then(perguntas => {
            res.render('listar', {
                perguntas: perguntas
            });
        }).catch(err => {
        res.send("Error: " + err);
    });
});

app.get("/storePerguntas", (req, res) => {
    res.render('pergunta');
});

app.post('/question/delete/:id', (req, res) => {
    const perguntaId = req.params.id;

    perguntaModel.destroy({
        where: { id: perguntaId }
    }).then(() => {
        res.redirect('/');
    }).catch(err => {
        console.log("Erro ao apagar pergunta: " + err);
        res.redirect('/');
    });
});


app.post("/salvarQuestao", (req, res) => {
    const { titule, description } = req.body;

    perguntaModel.create({
        titulo: titule,
        descricao: description
    }).then(() => {
        res.redirect('/');
    }).catch(err => {
        res.send("Error: " + err);
    });
});

app.get('/respostas/:id', (req, res) => {
    const perguntaId = req.params.id;
    perguntaModel.findByPk(perguntaId).then(pergunta => {
        if (pergunta != undefined) {
            respostaModel.findAll({
                where: { perguntaId: perguntaId }
            }).then(respostas => {
                res.render('lerResposta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        } else {
            res.redirect('/');
        }
    });
});

app.post('/responder', (req, res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;

    respostaModel.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect('/respostas/' + perguntaId);
    }).catch((err) => {
        console.log("Erro ao criar resposta: " + err);
        res.redirect('/');
    });
});


app.get('/responder/:id', (req, res) => {
    const perguntaId = req.params.id;

    perguntaModel.findByPk(perguntaId).then(pergunta => {
        if (pergunta != undefined) {
            respostaModel.findAll({
                where: { perguntaId: perguntaId }
            }).then(respostas => {
                res.render('responder', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        } else {
            res.redirect('/');
        }
    });
});

app.post('/resposta/delete/:id', (req, res) => {
    const respostaId = req.params.id;

    respostaModel.destroy({
        where: { id: respostaId }
    }).then(() => {
        res.redirect('back');
    }).catch(err => {
        console.log("Erro ao apagar resposta: " + err);
        res.redirect('back');
    });
});

app.post('/respostas/deleteall/:id', (req, res) => {
    const perguntaId = req.params.id;

    respostaModel.destroy({
        where: { perguntaId: perguntaId }
    }).then(() => {
        res.redirect('back');
    }).catch(err => {
        console.log("Erro ao apagar todas as respostas: " + err);
        res.redirect('back');
    });
});


// Servidor
app.listen(3000, (err) => {
    if (err) {
        console.log("Erro ao iniciar servidor");
    } else {
        console.log("Servidor iniciado na porta 8181...");
    }
});
