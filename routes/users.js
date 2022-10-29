const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
const { route } = require('./admin');
var db = require('../config/connection')
var collection = require('../config/collections');
const async = require('hbs/lib/async');
var objectId = require('mongodb').ObjectId

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/', async function (req, res, next) {
  let user = req.session.user

  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  productHelpers.getAllProducts().then((products) => {

    res.render('index', { products, user, cartCount });
  })

});

router.get('/login', (req, res, next) => {
  if (req.session.user) {
    res.redirect('/')
  } else
    res.render('login', { "LoginErr": req.session.userLoginErr });
  req.session.userLoginErr = false
});

router.get('/userresg', function (req, res, next) {
  res.render('userregister', { admin: false });
});

router.post('/signup', (req, res, next) => {

  req.body.userActived = true;
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user = response
    req.session.userLoggedIn = true

    res.redirect('login',);
  })
});

router.post('/login', (req, res, next) => {


  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {

      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = "invalid user name or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})

router.get('/account', verifyLogin, async (req, res) => {
  let user = await userHelpers.getOneuserDetails(req.session.user._id)
  res.render('user/profile', { user })
})


router.get('/cart', verifyLogin, async (req, res) => {

  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = 0
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  try {
    couponHelpers.getAllCoupon().then((coupons) => {
      res.render('user/add-to-cart', { products, user: req.session.user._id, total, cartCount, coupons })
    })
  } catch (err) {
    next(err)
  }
})
//

//



router.get('/addtocart/:id', verifyLogin, (req, res) => {

  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect('/')
    res.json({ status: true });
  })
})
router.get('/heart_icon', verifyLogin, async (req, res) => {
  let products = await userHelpers.getFavProducts(req.session.user._id)

  res.render('user/favourite', { products, user: req.session.user._id })
})

router.get('/addtofavourite/:id', verifyLogin, (req, res) => {

  userHelpers.addToFavourite(req.params.id, req.session.user._id).then(() => {
    res.redirect('/')
  })
})
router.post('/change-product-quantity', verifyLogin, (req, res, next) => {

  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)

  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  req.session.coupen = false;
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  couponHelpers.getAllCoupon().then((coupons) => {
    res.render('user/checkout', { total, user: req.session.user, coupons })
  })
})
router.post('/place-order', verifyLogin, async (req, res) => {

  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  console.log(req.session.coupen, 'vava');
  id = req.session.user._id;
  discount = req.session.coupen.discount
  coupenId = req.session.coupen._id
  if (req.session.coupen) {
    totalPrice = totalPrice - discount;
    await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) },
      {
        $push: { "coupen": objectId(coupenId) }
      })
  }
  console.log("tota", totalPrice);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['paymentmethod'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }

  })

})
router.get('/order-success', verifyLogin, (req, res) => {

  res.render('user/order-success', { user: req.session.user })
})
router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)

  res.render('user/orders', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params._id)

  res.render('user/view-order-products', { user: req.session.user, products })
})

router.get('/product-details/:id', async (req, res) => {

  let product = await productHelpers.getProductDetails(req.params.id)


  res.render('user/product-details', { product })
})
router.post('/verify-payment', verifyLogin, (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("payment successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: 'payment error' })
  })

})
router.post("/delete-wish", (req, res, next) => {
  console.log('jjjjjjjjjjjjj', req.body);
  try {
    pid = req.body.pid;
    id = req.body._id;



    userHelpers.deleteWish(id, pid).then((response) => {
      res.json(response);
    });
  } catch (error) {
    next(error);
  }
});

router.post("/delete-cart", (req, res, next) => {
  console.log('cccccccccccccc', req.body);
  try {
    pid = req.body.pid;
    id = req.body._id;



    userHelpers.deleteCart(id, pid).then((response) => {
      res.json(response);
    });
  } catch (error) {
    next(error);
  }
});


router.post("/checkCoupen", async (req, res, next) => {
  try {
    if (req.session.coupen) {
      res.json({ msg: 'coupenapplied' });
    } else {
      console.log("ghfhg", req.body);
      ccode = req.body.value
      id = req.session.user._id;
      var data = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon: ccode })
      console.log('lalal', data);
      if (data.length != 0) {
        let coupenExist = false;
        let coupen = await db.get().collection(collection.USER_COLLECTION)
          .findOne({ _id: objectId(id), 'coupen': { $in: [data._id] } })
        if (coupen == null) {
          console.log('true');
          req.session.coupen = data;
          console.log('kaak', req.session.coupen);
          res.json({ msg: 'success', data: data });

        }
        else {
          console.log('exist');
          res.json({ msg: 'coupenExist' });
        }

        console.log(coupen, "aa", coupen);
       
      }
      else {
        console.log("coupen not found");
        res.json({ msg: 'coupennotfound' });
      }
    }


  }
  catch (err) {
    next(err)
  }
})
router.get('/add-address',async(req,res)=>{
  let user = await userHelpers.getOneuserDetails(req.session.user._id)

  res.render('user/userAddress',{user})

})
router.post('/edit-user/:id', (req, res, next) => {
    
   userHelpers.editUserDetails(req.params.id,req.body).then(()=>{

    res.redirect('/account');
  })
});

router.post('/addAddress/:id',(req, res, next) => {  
   
  console.log('kkkkkkkkkkkkkkkkkkkkkkkkk');
  addressData=req.body
  userId=req.session.user._id;
 
userHelpers.addAddress(userId,addressData).then(()=>{
    res.redirect('/add-address');
  })
  
});
router.get('',(req,res)=>{
  userHelpers.orderShipped(req.body['order[receipt]']).then(() => {

    
  })

})


  


module.exports = router;
