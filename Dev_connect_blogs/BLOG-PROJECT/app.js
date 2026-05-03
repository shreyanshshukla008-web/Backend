const express = require("express");
const axios = require("axios");
const path = require("path");

require("dotenv").config();

const app = express();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
const apiBaseUrl = `http://localhost:${port}`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.render("pages/login");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.post("/register", async (req, res) => {
  try {
    await axios.post(`${apiBaseUrl}/api/auth/register`, req.body);
    res.redirect("/");
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(400).send("Registration failed");
  }
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
      email,
      password
    });

    const token = response.data.token;
    const postsRes = await axios.get(`${apiBaseUrl}/api/posts`);

    res.render("pages/dashboard", {
      posts: postsRes.data,
      token
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(400).send("Login failed");
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const postsRes = await axios.get(`${apiBaseUrl}/api/posts`);

    res.render("pages/dashboard", {
      posts: postsRes.data,
      token: req.query.token || ""
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).send("Unable to load dashboard");
  }
});

app.get("/create-post", (req, res) => {
  res.render("pages/creatPost", {
    token: req.query.token || ""
  });
});

app.post("/create-post", async (req, res) => {
  try {
    const { title, content, token } = req.body;

    if (!token) {
      return res.status(401).send("Login token missing. Please log in again.");
    }

    await axios.post(
      `${apiBaseUrl}/api/posts`,
      { title, content },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.redirect(`/dashboard?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(400).send("Error creating post");
  }
});

module.exports = app;
