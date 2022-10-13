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
   cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
   
  productHelpers.getAllProducts().then((products)=>{
    console.log('cartCount',cartCount);
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

router.get('/account',verifyLogin,async(req,res)=>{
  let user=await userHelpers.getOneuserDetails(req.session.user._id)
  res.render('user/profile',{user})
})


router.get('/cart',verifyLogin,async(req,res)=>{
  
  let products=await userHelpers. getCartProducts(req.session.user._id)

  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/add-to-cart',{products,user:req.session.user._id,total})
})


router.get('/addtocart/:id',(req,res)=>{

  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    // res.redirect('/')
    res.json({status:true});
  })
})
router.get('/heart_icon',verifyLogin,async(req,res)=>{
  let products=await userHelpers. getFavProducts(req.session.user._id)
  
  res.render('user/favourite',{products,user:req.session.user._id})
})

router.get('/addtofavourite/:id',verifyLogin,(req,res)=>{
  
  userHelpers.addToFavourite(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
  })
  router.post('/change-product-quantity',(req,res,next)=>{
    
    userHelpers.changeProductQuantity(req.body).then( async(response)=>{
     response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response)

    })
  })
  router.get('/place-order',verifyLogin, async(req,res)=>{
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/checkout',{total,user:req.session.user})
  })
  router.post('/place-order',async(req,res)=>{
    let products=await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products).then((response)=>{
     res.json({status:true})
    })
    console.log(req.body);
  })
  router.get('/order-success',verifyLogin,(req,res)=>{
    
    res.render('user/order-success',{user:req.session.user})
  })
  router.get('/orders',verifyLogin, async(req,res)=>{
    let orders= await userHelpers.getUserOrders(req.session.user._id)
    
    res.render('user/orders',{user:req.session.user,orders})
  })
  router.get('/view-order-products/:id',verifyLogin, async(req,res)=>{
    let products= await userHelpers.getOrderProducts(req.params._id)
    
    res.render('user/view-order-products',{user:req.session.user,products})
  })
  
  router.get('/product-details/:id', async(req,res)=>{
  
    let product=await productHelpers.getProductDetails(req.params.id)
  

    res.render('user/product-details',{product})
  })
  
  
 





module.exports = router;
