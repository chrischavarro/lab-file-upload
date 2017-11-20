const express = require('express');
const commentsRouter = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
var multer = require('multer');
var upload = multer({ dest: './public/uploads/' });
const Post = require('../models/post');
const Comment = require('../models/comment');

commentsRouter.get('/:postId/comment', ensureLoggedIn('/login'), (req, res, next) => {
  const postId = req.params.postId

  res.render('comments/new', { postId })
})

commentsRouter.post('/:postId/comment', ensureLoggedIn('/login'), upload.single('picture'), (req, res, next) => {
  const postId = req.params.postId;
  const content = req.body.content;

  if (req.file) {
    var imagePath = `/uploads/${req.file.filename}`;
    var imageName = req.body.imageName;
  } else {
    var imagePath = "";
    var imageName = "";
  }

  const newComment = new Comment({
    content,
    authorId: req.user._id,
    imagePath,
    imageName
  })

  newComment.save((err, comment) => {
    if (err) {
      res.render('posts/index', { message: 'An error occurred' });
    } else {
      Post
      .findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id }},
        { new: true },
        ((err) => {
          if (err) {
            res.redirect('/')
            console.log(err)
          } else {
            res.redirect('/posts')
          }
        })
      )
    };
  });
});

module.exports = commentsRouter;
