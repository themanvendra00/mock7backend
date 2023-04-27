const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/user.model");
require("dotenv").config();
const key = process.env.HASHKEY;

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        const user = new UserModel({ name, email, password: hash });
        await user.save();
        res.send({message:"User register successful"});
      }
    });
  } catch (error) {
    console.log("Error occurred while registering user");
    console.log(error);
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    const hashed_password = user[0]?.password;
    if (user.length > 0) {
      bcrypt.compare(password, hashed_password, (err, result) => {
        if (result) {
          const token = jwt.sign({ userID: user[0]._id }, key);
          res.send({ message: "Login successful", token: token });
        } else {
          res.send({ error: "Invalid email or password" });
        }
      });
    } else {
      res.send({ error: "User not found" });
    }
  } catch (error) {
    console.log("Error occurred while loggin in!");
    console.log(error);
  }
});

module.exports = {
  userRouter,
};
