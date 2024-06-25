const express = require("express");
const router = express.Router();

router.use('/registroventas',require("./registroVentas"));
router.use('/user',require("./user"));

module.exports = router;