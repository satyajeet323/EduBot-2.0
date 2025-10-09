const express = require("express");
const router = express.Router();
const { runCode } = require("../controllers/codeController");

router.post("/", runCode);  // POST method

module.exports = router;

