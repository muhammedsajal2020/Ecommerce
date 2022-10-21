const e = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/adminHelpers');
var router = express.Router();
const multer = require('multer');
const { response } = require('../app');
const userHelpers = require('../helpers/user-helpers');
const categoryHelpers= require('../helpers/category-helpers');
const couponHelpers= require('../helpers/coupon-helpers');
const ADMINMAIL='admin@gmail.com';
const ADMINPASSWORD='admin123';
const verifyLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('admin/adminlogin')
  }
}

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
router.get('/',function(req, res, next) {
  if(verifyLogin){
    res.render('admin/adminlogin')
  }else{
   
    res.render('admin/adminhome',)
  }
});
router.get('/adminlogin',(req,res)=>{
  res.render('admin/adminlogin')
})

router.post('/adminlogin', function(req, res, next) {
  
  if(req.body.email== ADMINMAIL && req.body.password== ADMINPASSWORD){
    req.session.adminLoggedIn=true
    res.render('admin/adminhome')
  }else{
    wrongpassword="invalid user name or password"
    res.redirect('/admin/adminlogin')
  }

 
});




router.get('/addproduct',verifyLogin,function(req, res, next) {
  categoryHelpers.getAllCategory().then((categorys)=>{

  res.render('admin/add-product',{categorys})
  })
});

router.get('/addcategoty',verifyLogin, function(req, res, next) {
  categoryHelpers.getAllCategory().then((categorys)=>{
  res.render('admin/add-category',{categorys})
  })
});

router.post('/addcategory',verifyLogin, function(req, res, next) {

console.log(req.body);
categoryHelpers.insertCategory(req.body)

  res.redirect('/admin/addcategoty')
});

router.get('/view-products', verifyLogin, function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    

  res.render('admin/view-products',{admin:true,products})
  })
});
router.post('/adminloginbtn',verifyLogin, function(req, res, next) {

  res.redirect('/admin',)
});

router.post('/add-product' , verifyLogin,uploads.array("image", 3),(req,res)=>{
  
  const images = [];
  for (i = 0; i < req.files.length; i++) {
    images[i] = req.files[i].filename;
  }
  req.body.images = images
  adminHelpers.insertProducts(req.body)
  res.redirect("/admin/addproduct")
})


router.get('/userdetails', verifyLogin, function(req, res, next) {
  userHelpers. getAllusers().then((users)=>{
    

  res.render('admin/user-details',{users,admin:true})
  })


});

router.get('/admin-add-new-user', verifyLogin, function(req, res, next) {
  

  res.render('admin/add-new-user',{admin:true})
});

router.get('/delete-product/:id', verifyLogin, (req, res, next)=> {
  let proId=req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products')
  })
  
  
 
});



router.get('/edit-product/:id',verifyLogin, async (req, res, next)=> {
  let product=await productHelpers.getProductDetails(req.params.id)
  categoryHelpers.getAllCategory().then((categorys)=>{

  res.render('admin/edit-product',{product,categorys})
  })
});
router.post('/edit-product/:id',verifyLogin,uploads.array("image", 3),(req, res)=>{
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
router.get('/block_user/:id', verifyLogin, (req, res, next)=> {
  try {
    let userId = req.params.id;
    userHelpers.blockUser(userId).then((response) => {
      res.redirect('/admin/userdetails');
    })

  } catch (error) {
    res.redirect('/err',{error})

  }
});
router.get('/active_user/:id',verifyLogin, (req, res, next)=> {
    try {
      let userId = req.params.id;
      userHelpers.activeUser(userId).then((response) => {
        res.redirect('/admin/userdetails');
      })
  
    } catch (error) {
      res.redirect('/err',{error})
  
    }
  });
  router.get('/grneral_tables', verifyLogin,(req,res)=>{
    
    res.render('admin/tables',{admin:true})
  })
  router.get('/orders', verifyLogin,(req,res)=>{
    adminHelpers.getAllorders().then((orders)=>{
    res.render('admin/orders',{admin:true,orders})
    })
  })
  router.get('/css-test', verifyLogin,(req,res)=>{
res.render('admin/css-test')
  })

  router.get('/addcoupon',(req,res)=>{
   
    res.render('admin/add-coupon',{admin:true})
  })
  router.post('/add-coupon', (req, res,next) => {
    
    try {
      couponHelpers.addCoupon(req.body,(id) =>{
        
        res.redirect('/admin/addcoupon')
      }) 
      
    } catch (error) {
      next(error)
    }
   
     });

  //error
router.use(function(req, res, next) {
  // next(createError(404));
  res.render('admin/err404admin')
});

// error handler
router.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = router;
