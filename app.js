const bodyParser =  require("body-parser");
const mongoose =    require("mongoose");
const express =     require("express");
const app =         express();

mongoose.connect("mongodb://localhost:27017/RESTfulBlogApp", {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public")); // allows to use custom css
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create mongoose schema
const blogSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  isDraft: {type: Boolean, default: false},
  dateCreated: {type: Date, default: Date.now}
});

// compile schema into model
const Blog = mongoose.model("Blog", blogSchema);

// test
// Blog.create({
//   title: "Another Cute bb",
//   image: "https://i.pinimg.com/736x/2a/e9/a4/2ae9a40b4363e74554dcae603cd8356d.jpg",
//   body: "I came across another image of some corgis today. Could this be a sign?"
// });

app.get("/", function(req, res) {
  res.redirect("/blogs");
});

// index route
app.get("/blogs", function(req, res) {
  // retrieve all blogs from db
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      // grabbing data, whatever comes back from db will be in the variable "blogs"
      res.render("index", {blogs: blogs.filter(blogFilter => !blogFilter.isDraft)});
    }
  });
});

// new route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

// create route
app.post("/blogs", function(req, res) {
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});


// hosting local server
app.listen(8000, "localhost", function() {
  console.log("RESTfulBlogApp is running...");
});
