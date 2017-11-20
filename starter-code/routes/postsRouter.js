const express = require('express');
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const postsRouter = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/uploads/' });
const Post = require('../models/post');
const Comment = require('../models/comment');


postsRouter.get('/new', ensureLoggedIn('/login'), (req, res, next) => {
  res.render('posts/new');
  console.log(req.user);
});

postsRouter.post('/create', ensureLoggedIn('/login'), upload.single('picture'), (req, res, next) => {
  const content = req.body.content;
  const creatorId = req.user._id;
  const picPath = `/uploads/${req.file.filename}`;
  const picName = req.body.picName;

  const newPost = new Post({
    content,
    creatorId,
    picPath,
    picName
  });

  newPost.save((err) => {
    if (err) {
      res.render('index', { message: 'An error occurred' })
      console.log('an error occurred')
    } else {
      res.redirect('/posts')
      console.log('Completed')
    }
  });
});

postsRouter.get('/', (req, res, next) => {
  Post
    .find({})
    .exec((err, posts) => {
      if (err) {
        res.redirect('/login')
      }
      else {
        res.render('posts/index', { posts })
      }
    });
});

postsRouter.get('/:postId', (req, res, next) => {
  const postId = req.params.postId;

  Post
    .findOne({ "_id": postId })
    .exec((err, post) => {
      if (err || !post) {
        res.render('posts/index', { message: 'An error occured' })
      }
      else {
        Comment
        .find({ "_id": post.comments })
        .exec((err, comments) => {
          if (err) {
            res.render('posts/index', { message: 'An error occurred' })
          } else {
            res.render('posts/show', { post, comments })
          }
        })
      }
    });
});



module.exports = postsRouter;
