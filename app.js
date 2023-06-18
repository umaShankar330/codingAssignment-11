const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "twitterClone.db");
const bcrypt = require("bcrypt");

app.use(express.json());

let db = null;
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at 3000");
    });
  } catch (e) {
    console.log(e.message);
    console.log("error");
    process.exit(1);
  }
};
initializeDb();

// api-1 register

checkUser = async (request, response, next) => {
  const { username, password, name, gender } = request.body;
  const checkUser = `SELECT * FROM user WHERE username LIKE '${username}'`;
  const isExist = await db.get(checkUser);
  //   let newUserId = isExist.lastID;
  console.log(username);
  console.log(username);
  if (isExist !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 6) {
      response.status(400);
      response.send("Password is too short");
    } else {
      response.details = {
        username: username,
        password: password,
        name: name,
        gender: gender,
      };
      next();
    }
  }
};

app.post("/register/", checkUser, async (request, response) => {
  const { username, password, name, gender } = request.body;
  const hashPwd = await bcrypt.hash(password, 10);
  const sqliteQuery = `INSERT INTO user(user_id,name,username,password,gender) 
  VALUES('${112}','${username}','${hashPwd}','${name}','${gender}') `;
  await db.run(sqliteQuery);
  response.status(200);
  response.send("User created successfully");
  console.log("Update successfull");
});

// api-2

// validateUser = async (request, response, next) => {};

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const query = `SELECT * FROM user WHERE username='${username}'`;
  const result = await db.get(query);
  console.log(username);
  if (result === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    if (password !== result.password) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "my_secret");
      response.send({ jwtToken });
    }
  }
});

module.exports = app;
