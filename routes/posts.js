var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

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