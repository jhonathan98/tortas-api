const { Sequelize } = require('sequelize');

const connection = new Sequelize(process.env.SERVER_DB_NAME, process.env.SERVER_DB_USER, process.env.SERVER_DB_PASS, {
    host: process.env.SERVER_DB_HOST,
    port:process.env.SERVER_DB_PORT,
    dialect:  'postgres'    
});


connection.authenticate().then(()=>{
    console.log('Conectado correctamente a la base de datos',process.env.SERVER_DB_NAME);
}).catch((error)=>{
    console.error('Sin conexión a la base de datos:',process.env.SERVER_DB_NAME, error);
})

module.exports = {
    Sequelize,
    connection
}
