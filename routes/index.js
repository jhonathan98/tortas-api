const express = require("express");
const router = express.Router();

router.use('/registroventas',require("./registroVentas"));

module.exports = router;