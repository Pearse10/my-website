// Login info
// us: admin, pw: test123



console.log("Looking for database at:", require.resolve("./database.js"));


const express = require("express");
const session = require("express-session"); 
const path = require("path");

const app = express();
console.log("Views folder absolute path:", path.join(__dirname, "views"));

const PORT = 3000;

// for database
const db = require("./database.js");




//styling
app.use(express.static(path.join(__dirname, "public")));



// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session setup (temporary memory store for now)
app.use(
  session({
    secret: "supersecretstring",
    resave: false,
    saveUninitialized: true,
  })
);


// Make session available in all EJS views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});



//site wide login start
// Site-wide lock: force login for all pages (except login/logout/static)
const OPEN_PATHS = new Set(['/login', '/logout']);
app.use((req, res, next) => {
  // already logged in → proceed
  if (req.session.loggedIn) return next();

  // allow the login/logout routes
  if (OPEN_PATHS.has(req.path)) return next();

  // allow static files (css/images/js)
  if (/\.(css|js|png|jpg|jpeg|svg|ico)$/.test(req.path)) return next();

  // otherwise, send to login
  return res.redirect('/login');
});
//site-wide login end



// Page routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/projects", (req, res) => {
  const projects = db.prepare("SELECT * FROM projects").all();
  res.render("projects", { title: "Projects", projects });
});


app.get("/projects/new", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  res.render("newProject", { title: "Add Project" });
});



// Login page (GET)
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Handle login (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // hardcoded for now -- will replace with DB later
  if (username === "admin" && password === "test123") {
    req.session.loggedIn = true;
    return res.redirect("/");
  }

  res.send("Invalid credentials");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});



app.post("/projects", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  const { title, description } = req.body;

  db.prepare("INSERT INTO projects (title, description) VALUES (?, ?)").run(title, description);

  req.session.success = "Project added successfully!";
  res.redirect("/projects");
});

// Delete project
app.post("/projects/delete", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");

  const { id } = req.body;
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);

  req.session.success = "Project deleted successfully!";
  res.redirect("/projects");
});




// Start server
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
