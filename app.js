const method_override = require("method-override");
const bodyParser =  require("body-parser");
const mongoose =    require("mongoose");
const express =     require("express");
const app =         express();

mongoose.connect("mongodb://localhost:27017/RESTfulBlogApp", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
app.use(method_override("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public")); // allows to use custom css

// create mongoose schema
const blogSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  is_draft: {
    type: Boolean,
    default: false
  },
  date_created: {
    type: Date,
    default: Date.now
  }
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
      // grabbing data, whatever comes back from db will be in the variable "blogs" unless it is a draft
      res.render("index", {blogs: blogs.filter(blogFilter => !blogFilter.is_draft)});
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

// show route
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});

// edit route
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

// update route
app.put("/blogs/:id", function(req, res) {
  // id, new data, callback
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// destroy route
app.delete("/blogs/:id", function(req, res) {
  Blog.findByIdAndDelete(req.params.id, function(err, foundBlog) {
    if(err) {
      res.send("Something went wrong.");
    } else {
      res.redirect("/blogs");
    }
  });
});

// hosting local server
app.listen(8000, "localhost", function() {
  console.log("RESTfulBlogApp is running...");
});
