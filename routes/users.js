var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('index',{admin:false,products});
  })
 
});

router.get('/login', function(req, res, next) {
  res.render('login',{admin:true});
});
router.get('/userresg', function(req, res, next) {
  res.render('userregister',{admin:false});
});


module.exports = router;
