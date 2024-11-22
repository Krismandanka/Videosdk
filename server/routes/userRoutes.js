const express = require("express")
const router = express.Router()


const {userCreate} = require("../controllers/UserCreate"); 


router.post("/userCreate", userCreate)
module.exports = router;


