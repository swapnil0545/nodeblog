var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req, res, next){
   var posts = db.get('posts');
   posts.findById(req.params.id, function(err, post){
      if(err) throw err;
      res.render('show', {'title': post.title, 'post': post});
   });
});

router.post('/addcomment', function(req, res, next){
   var name = req.body.name;
   var email = req.body.email;
   var body = req.body.body;
   var postId = req.body.postid;
   var commentDate = new Date();
   
   req.checkBody('name', 'Name is required').notEmpty();
   req.checkBody('email', 'Email is required').notEmpty();
   req.checkBody('email', 'Must be an email').isEmail();
   req.checkBody('body', 'Body is required').notEmpty();
   
   var errors = req.validationErrors();
   
   if(errors) {
       var posts = db.get('posts');
       posts.findById(postId, function(err, post){
            if(err) throw err;
            res.render('show', {'errors': errors, 'post': post});
       });
   } else {
        var comment = {'name': name, 'email': email, 'body': body, 'commentdate': commentDate};
        var posts = db.get('posts');
        posts.update({
            '_id': postId   
        },
        {
            $push:{
                'comments': comment
            }
        }, function(err, doc){
                if(err) throw err;
                req.flash('success', 'Comment Added');
                res.location('/posts/show/'+postId);
                res.redirect('/posts/show/'+postId);
            }
        );
   }
});

router.get('/add', function(req, res, next){
    var categories = db.get('categories');
    categories.find({},{}, function(err, categories){
        if(err) throw err;
        res.render('addpost', {'title': 'Add Post', 'categories': categories});
    });
});

router.post('/add', function(req, res, next){
    // Get form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    
    
    if(req.files.mainimage) {
        var mainImageOriginalName = req.files.mainimage.originalName;
        var mainImageName = req.files.mainimage.name;
        var mainImageMime = req.files.mainimage.mimetype;
        var mainImagePath = req.files.mainimage.path;
        var mainImageExt = req.files.mainimage.extension;
        var mainImageSize = req.files.mainimage.size;
    } else {
        var mainImageName = 'noimage.png';
    }
    
    // Form Validation
    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required');
    
    // Check Errors
    var errors = req.validationErrors();
    
    if(errors) {
        res.render('addpost', {'errors': errors, 'title': title, 'body': body});
    } else {
        var posts = db.get('posts');
        
        // Submit to db
        posts.insert({
            'title': title,
            'body': body,
            'category': category,
            'date': date,
            'author': author,
            'mainimage': mainImageName
        }, function(err, post){
            if(err){
                res.send('There was an issue submitting the post');
            }
            req.flash('success', 'Post Submitted');
            res.location('/');
            res.redirect('/');
        });
    }
});

module.exports = router;