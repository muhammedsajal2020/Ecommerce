const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if (req.session.user){
    cartCount=await userHelpers.getCartCount(req.session._id)
  }
   
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('index',{products,user,cartCount});
  })
 
});

router.get('/login',(req, res, next)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else
  res.render('login',{"loginErr":req.session.loginErr});
  req.session.loginErr=false
});

router.get('/userresg', function(req, res, next) {
  res.render('userregister',{admin:false});
});

router.post('/signup',(req, res, next)=> {
  req.body.userActived = true;
userHelpers.doSignup(req.body).then((response)=>{
  console.log(response);
  res.redirect('login',);
  })
});

router.post('/login',(req, res, next)=>{
  console.log("login worked");

  userHelpers.doLogin(req.body).then((response)=>{
   
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }
    else{
      req.session.loginErr="invalid user name or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/account',verifyLogin,(req,res)=>{
  res.render('user/profile')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers. getCartProducts(req.session.user._id)
  
  res.render('user/add-to-cart',{products,user:req.session.user._id})
})

router.get('/addtocart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
})
//m


//new
router.get('/heart_icon',verifyLogin,async(req,res)=>{
  let products=await userHelpers. getFavProducts(req.session.user._id)
  
  res.render('user/favourite',{products,user:req.session.user._id})
})



//
router.get('/addtofavourite/:id',verifyLogin,(req,res)=>{
  
  userHelpers.addToFavourite(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
  })





module.exports = router;
