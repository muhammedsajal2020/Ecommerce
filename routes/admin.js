var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/adminhome',)
});
router.get('/login', function(req, res, next) {
  res.render('admin/adminlogin',)
});
router.get('/addproduct', function(req, res, next) {

  res.render('admin/addproduct')
});
router.post('/adminloginbtn', function(req, res, next) {
  console.log('hi')
  console.log(req.body)
  res.redirect('/admin',)
});










module.exports = router;
