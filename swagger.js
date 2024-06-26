const swaggerJsdoc =  require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const path = require("path")

const options = {
    definition: {
    openapi: '3.0.0',
    info: {
        title: 'API tortas el gordo',
        description: "API endpoints para inventario de tortas gordo, servicios de documentacion on swagger",
        contact: {
        name: "Jhonathan cordoba",
        email: "jhonathanandres98@gmail.com",
        //url: "https://github.com/DesmondSanctity/node-js-swagger"
        url: "https://github.com/jhonathan98/tortas-api.git"
        },
        version: '1.0.0',
    },
    servers: [
        {
        url: "http://localhost:4000/",
        description: "Local server"
        },
        {
        url: "<your live url here>",
        description: "Live server"
        },
    ]
    },
    // looks for configuration in specified directories    
    apis:[`${path.join(__dirname,"./routes/*.js")}`]
}
const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app, port) => {
    // Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    // Documentation in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })
    console.log("swagger generate....")
}

module.exports = swaggerDocs;