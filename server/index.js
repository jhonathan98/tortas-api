const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes  = require("../routes");
const swaggerDocs = require("../swagger");


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

const PORT = process.env.PORT || 4000;

app.use('/api',routes)

swaggerDocs(app,PORT);

module.exports = {
    Server:app,
    PORT
}