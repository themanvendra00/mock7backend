const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.route");
require("dotenv").config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}));

app.get("/", (req, res) => {
  res.send("Basic API endpoint");
});

app.use("/users", userRouter);

app.get("/auth/github", async (req, res) => {
  const { code } = req.query;
  console.log(code);

  const accessToken = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
      }),
    }
  ).then((res) => res.json());

  const userDetails = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken.access_token}`,
    },
  }).then((res) => res.json());
  res.send(userDetails);
});

app.listen(port, async () => {
  try {
    await connection;
    console.log("Connected to db");
  } catch (error) {
    console.log("Error occurred while connecting to db");
    console.log(error);
  }
  console.log(`App is running on http://localhost:${port}`);
});
