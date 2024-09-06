const express = require("express"); 
const app = express(); 
const bodyParser = require('body-parser')

const connection = require('./database/database');
const perguntaModel = require("./database/pergunta");
const respostaModel = require("./database/resposta");

connection.authenticate().then(() =>{
    console.log("Connected")
})


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
 
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.post("/savequestion", (request, response) =>{
    const titule = request.body.titule
    const description = request.body.description

    perguntaModel.create({
        titulo: titule,
        descricao: description
    }).then(() => {
        response.redirect('/')
    })
})

app.post('/responder', (request, response) =>{
    var corpo = request.body.corpo
    var perguntaId = request.body.pergunta

    respostaModel.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        response.redirect('/question/' + perguntaId)
    })
})

app.get('/', (requestion, response) => {
    perguntaModel.findAll({raw: true, order:[['id', 'DESC']]}).then(pergunta => {
        response.render('index', {
            perguntas: pergunta
        })
    })
})

app.get('/question/:id', (requestion, response) => {
    var id = requestion.params.id

    perguntaModel.findOne({
        where: {id :id}
    }).then(pergunta => {
        if(pergunta != undefined){
            respostaModel.findAll({
                where: {perguntaId: pergunta.id}
            }).then(respostas => {
                response.render('detalhepergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                })
            })
        }else{
            console.log("n tem")
        }
    })
})

app.get("/question", (request, response) =>{
    response.render('question')
})

app.get('/resposta/delete/:id',(req,res)=>{
    var id = req.params.id
    respostaModel.destroy({
        where: {
            id: id
        }
    }).then(()=>{
        res.redirect('back')
    })
})

// app.get("/:name/:language", function (req, res) { 
//     const name = req.params.name
//     const dev = req.params.language
//     const showMensage = false
//     const products = [
//         {name: "Keyboard", price: 150},
//         {name: "Monitor", price: 150}
//     ]

//    res.render('index', {
//         name: name,
//         dev: dev,
//         company: "Unifae",
//         salary: 10000,
//         showMensage: showMensage,
//         products: products
//    }); 
// }); 
 
app.listen(8181, function (erro) { 
   if (erro) { 
       console.log("Erro"); 
   } else { 
       console.log("Servidor iniciado..."); 
   } 
}); 