var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index',{admin:false});
});

router.get('/login', function(req, res, next) {
  res.render('login',{admin:true});
});
router.get('/userresg', function(req, res, next) {
  res.render('userregister',{admin:false});
});

module.exports = router;
