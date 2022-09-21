var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/adminhome',)
});
router.get('/addproduct', function(req, res, next) {

  res.render('admin/addproduct')
});








module.exports = router;
