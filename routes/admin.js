const e = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();


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
router.post('/adminloginbtn', function(req, res, next) {
  console.log('hi')
  console.log(req.body)
  res.redirect('/admin',)
});

router.post('/add-product',(req,res)=>{
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    let ids = id.insertedId
    console.log(image);
    image.mv('./public/product-images/'+ids+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }else{
        console.log(''+err);
      }
      
    })
  })

})








module.exports = router;
