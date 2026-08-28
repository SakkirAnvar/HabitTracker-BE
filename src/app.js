const express = require("express");
const env = require("dotenv");

const app = express();
env.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running successfully on the PORT ${PORT}`);
});
