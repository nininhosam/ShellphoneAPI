/* 
Rota GET => Traz a arvore de crafting de todos os itens registrados
Rota GET/{item} => Aceita um item registrado e traz apenas a sua arvore de crafting
Rota POST/{item} => Aceita uma JSON como arvore de crafting de um novo item {item} 
Rota PUT/{item} => Corrige a arvore de crafting de um item {item} na base da JSON 
Rota DELTE/{item} => Deleta um item
*/

const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const allItems = require('./items.json');

async function checkForId(obj, id) {
    const response = await loopForId(obj, id);
    return response;
}
//retorna o o valor do indíce "id" no objeto "obj"
async function loopForId(obj, id) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === id)
            return obj[keys[i]];
        else {
            if (typeof obj[keys[i]] === 'object') {
                const check = await loopForId(obj[keys[i]], id);
                if (check != undefined)
                    return check;
            }
        }

    }
}
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send(
        allItems
    )
})

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    const response = await checkForId(allItems, id.toLowerCase());
    if (!response) {
        res.status(404).send(`Item not found`)
    }
    res.status(200).send(response);
})

app.post('/:id', (req, res) => {
    const { id } = req.params;
    const recipe = req.body;
    if (!recipe) {
        res.status(400).send("The item requires a description.")
    }
    if (allItems[id.toLowerCase()]) {
        res.status(409).send("This item already exists.")
    }
    allItems[id.toLowerCase()] = recipe;
    fs.writeFile("./items.json", JSON.stringify(allItems), err => {
        console.log(err);
    })
    res.send(allItems);
})

app.put('/:id', (req, res) => {
    const { id } = req.params;
    const recipe = req.body;
    if (!recipe) {
        res.status(400).send("The item requires a description.")
    }
    //check if there's id inside allItems, if there is, then write over it, if there isn't, throw error
    if (!allItems[id.toLowerCase()]) {
        res.status(404).send("Item not found.")
    }
    allItems[id.toLowerCase()] = recipe;
    fs.writeFile("./items.json", JSON.stringify(allItems), err => {
        console.log(err);
    })
    res.send(allItems)
})

app.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!allItems[id.toLowerCase()]) {
        res.status(404).send("Item not found.")
    }
    delete allItems[id.toLowerCase()]
    fs.writeFile("./items.json", JSON.stringify(allItems), err => { console.log(err); })
    res.send(allItems)
})

app.listen(
    PORT,
    () => console.log(`Server on, access at http://localhost/${PORT}`)
)