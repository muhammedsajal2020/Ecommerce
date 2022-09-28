const e = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/adminHelpers');
var router = express.Router();
const multer = require('multer');
const { response } = require('../app');


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
  const images = [];
  for (i = 0; i < req.files.length; i++) {
    images[i] = req.files[i].filename;
  }
  req.body.images = images
  adminHelpers.insertProducts(req.body)
  res.redirect("admin/add-product")
})





router.get('/userdetails', function(req, res, next) {
  

  res.render('admin/user-details')
});

router.get('/admin-add-new-user', function(req, res, next) {
  console.log('add new user worked');

  res.render('admin/add-new-user')
});

router.get('/delete-product/:id', (req, res, next)=> {
  let proId=req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products')
  })
  
  
 
});



router.get('/edit-product/:id', async (req, res, next)=> {
  let product=await productHelpers.getProductDetails(req.params.id)
  
console.log(product);
  res.render('admin/edit-product',{product})
});
router.post('/edit-product/:id',uploads.array("image", 3),(req, res)=>{
  console.log('haaaaaaaaaaaai2',req.body);
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-products')
    if(req.files.images){
      const images = [];
  for (i = 0; i < req.files.length; i++) {
    images[i] = req.files[i].filename;
  }
  req.body.images = images
  // adminHelpers.insertProducts(req.body)



    }
  })
})








module.exports = router;
