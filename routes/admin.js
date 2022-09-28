const e = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const multer = require('multer');


const storage = multer.diskStorage({
  destination: "public/product-images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const uploads = multer({
  storage
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('admin/adminhome',)

});
router.get('/login', function(req, res, next) {
  res.render('admin/adminlogin',)
});
router.get('/addproduct', function(req, res, next) {

  res.render('admin/add-product')
});
router.get('/view-products', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);

  res.render('admin/view-products',{admin:true,products})
  })
});
router.post('/adminloginbtn', function(req, res, next) {
  console.log('hi')
  console.log(req.body)
  res.redirect('/admin',)
});

router.post('/add-product',uploads.array("image", 3),(req,res)=>{
  console.log(req.files,'add product');

res.render("admin/add-product")
    
})








module.exports = router;
