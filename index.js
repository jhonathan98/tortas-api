require('dotenv').config();

const { Server, PORT } = require('./server');

Server.listen(PORT, () => console.log(`Server on ${PORT} , Fecha: ${new Date().toLocaleString('en-US')}`));