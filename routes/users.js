const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers');
const couponHelpers= require('../helpers/coupon-helpers');
const { route } = require('./admin');

const verifyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  
  let cartCount=null
  if (req.session.user){
   cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
   
  productHelpers.getAllProducts().then((products)=>{
    
    res.render('index',{products,user,cartCount});
  })
 
});

router.get('/login',(req, res, next)=>{
  if(req.session.user){
    res.redirect('/')
  }else
  res.render('login',{"LoginErr":req.session.userLoginErr});
  req.session.userLoginErr=false
});

router.get('/userresg', function(req, res, next) {
  res.render('userregister',{admin:false});
});

router.post('/signup',(req, res, next)=> {
  
  req.body.userActived = true;
userHelpers.doSignup(req.body).then((response)=>{
  req.session.user=response
  req.session.userLoggedIn=true
 
  res.redirect('login',);
  })
});

router.post('/login',(req, res, next)=>{
  

  userHelpers.doLogin(req.body).then((response)=>{
   
    if(response.status){
      
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }
    else{
      req.session.userLoginErr="invalid user name or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/account',verifyLogin,async(req,res)=>{
  let user=await userHelpers.getOneuserDetails(req.session.user._id)
  res.render('user/profile',{user})
})


router.get('/cart',verifyLogin,async(req,res)=>{
  
  let products=await userHelpers. getCartProducts(req.session.user._id)
  let total=0
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  if(products.length>0){
    total=await userHelpers.getTotalAmount(req.session.user._id)
  } 
  try{
    couponHelpers.getAllCoupon().then((coupons)=>{
      res.render('user/add-to-cart',{products,user:req.session.user._id,total,cartCount,coupons})
    })
  }catch (err){
    next(err)
  }
})
//

//



router.get('/addtocart/:id' ,verifyLogin,(req,res)=>{

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
  router.post('/change-product-quantity',verifyLogin,(req,res,next)=>{
    
    userHelpers.changeProductQuantity(req.body).then( async(response)=>{
     response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response)

    })
  })
  router.get('/place-order',verifyLogin, async(req,res)=>{
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/checkout',{total,user:req.session.user})
  })
  router.post('/place-order',verifyLogin,async(req,res)=>{
    
    let products=await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body['paymentmethod']==='COD'){
        res.json({codSuccess:true})
      }else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
     
    })
    
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
  
  router.get('/product-details/:id', verifyLogin, async(req,res)=>{
  
    let product=await productHelpers.getProductDetails(req.params.id)
  

    res.render('user/product-details',{product})
  })
  router.post('/verify-payment', verifyLogin,(req,res)=>{
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log("payment successfull");
        res.json({status:true})
      })
    }).catch((err)=>{
      console.log(err);
      res.json({status:false,errMsg:'payment error'})
    })

  })
  router.get("/delete-wish/:wishId/:proId", (req, res, next) => {
    try {
      wishId = req.params.wishId;
      proId = req.params.proId;
  
      userHelpers.deleteWish(wishId, proId).then((response) => {
        res.json(response);
      });
    } catch (error) {
      next(error);
    }
  });
  

module.exports = router;
