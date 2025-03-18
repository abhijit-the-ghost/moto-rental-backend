const express = require("express");
const app = express();
const port = process.env.PORT || 500;
const dbConnection = require("./db");

app.get("/", (req, res) => res.send("hello world"));
app.listen(port, () => console.log(`server is running on port ${port}`));
