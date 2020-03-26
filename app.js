require('dotenv').config()
const express_sanitizer = require("express-sanitizer");
const method_override = require("method-override");
const body_parser =  require("body-parser");
const mongoose =    require("mongoose");
const express =     require("express");
const app =         express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myrestfulblog', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect("mongodb://localhost:27017/RESTfulBlogApp", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
app.use(method_override("_method"));
app.use(body_parser.urlencoded({ extended: true }));
app.use(express_sanitizer());
app.use(express.json());
app.use(express.static("public")); // allows to use custom css
app.set("view engine", "ejs");

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

// display drafts
app.get("/blogs/drafts", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      // displays all blogs that are drafts
      res.render("index", {blogs: blogs.filter(blogFilter => blogFilter.is_draft)});
    }
  });
});

// new route
app.get("/blogs/new", function(req, res) {
  res.render("new");
});

// create route
app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
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
  req.body.blog.body = req.sanitize(req.body.blog.body);
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
  Blog.findByIdAndDelete(req.params.id, function(err) {
    if(err) {
      res.send("Something went wrong.");
    } else {
      res.redirect("/blogs");
    }
  });
});

// hosting heroku server

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("RESTfulBlogApp is running...");
});
