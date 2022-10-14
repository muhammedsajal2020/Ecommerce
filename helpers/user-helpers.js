var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
const { ObjectId } = require('mongodb')
const { response } = require('../app')
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_mClNRE8FWEq5Jp',
    key_secret: 'Ll7EcfrmETS6DQeeRNOtdkjF',
  });

module.exports={
    doSignup: (userData) => {
       
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
    
                resolve(data.insertedId)
            })
        })
    
    },
    doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                if(user.userActived){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }

                })
            }else{
                console.log('');
                resolve({status:false})
            }

            }else{
                console.log('login failed 2');
                resolve({status:false})
            }
        })
    },
    getAllusers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(users)
            
        })
    },
    addToCart:(proId,userId)=>{

        let proObj={
            item:objectId(proId),
            quantity:1,
        }
        return new Promise(async(resolve, reject) => {
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExit=userCart.products.findIndex(product=> product.item==proId)
                console.log('proExit',proExit);
                if(proExit !=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId), 'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()

                    })

                }else{
                 db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                {
                    
                        $push:{products:proObj}
 

                }
                ).then((response)=>{
                    resolve()
                })
                }
            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise( async(resolve, reject) => {
            
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                    }
                },
                 {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            
            ]).toArray()
            console.log(cartItems);
                resolve(cartItems)   
                   
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve, reject) => {
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{userActived:false}}).then(()=>{
                resolve()
            })
        })
    },
    
    activeUser:(userId)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{userActived:true}}).then(()=>{
                resolve()
        })
    })
    },
    addToFavourite:(proId,userId)=>{

        let proObj={
            item:objectId(proId),
            quantity:1,
        }
        return new Promise(async(resolve, reject) => {
            let userCart=await db.get().collection(collection.FAVOURITE_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExit=userCart.products.findIndex(product=> product.item==proId)
                console.log('proExit',proExit);
                if(proExit !=-1){
                    db.get().collection(collection.FAVOURITE_COLLECTION)
                    .updateOne({user:objectId(userId), 'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()

                    })

                }else{
                 db.get().collection(collection.FAVOURITE_COLLECTION)
                .updateOne({user:objectId(userId)},
                {
                    
                        $push:{products:proObj}
 

                }
                ).then((response)=>{
                    resolve()
                })
                }
            }else{
                let FavObj={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.FAVOURITE_COLLECTION).insertOne(FavObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getFavProducts:(userId)=>{
        return new Promise( async(resolve, reject) => {
            
            let FavItems= await db.get().collection(collection.FAVOURITE_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                    }
                },
                 {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            
            ]).toArray()
            console.log(FavItems);
                resolve(FavItems)   
                   
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        
        return new Promise((resolve, reject) => {
            if(details.count==-1 && details.quantity==1){
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)}, 
            {
                $pull:{products:{item:objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        }else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart), 'products.item':objectId(details.product)},
            

            {
                $inc:{'products.$.quantity':details.count}
            }
            ).then((response)=>{
                resolve({status:true})

            })
        }
    })
},
getTotalAmount:(userId)=>{
    return new Promise( async(resolve, reject) => {
            
        let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                }
            },
             {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity',{$toInt:'$product.product_price'}]}}
                }
            }
            //
        //     if(total.length==0){
        //         resolve(total)
        //   }else{
        //       resolve(total[0].total)
        //   }
            //
        
        ]).toArray()

        if(total.length==0){
                   resolve(total)
             }else{
               resolve(total[0].total)
             }
    })
},
placeOrder:(order,products,total)=>{
    return new Promise((resolve, reject) => {
        console.log(order,products,total);
        let status=order.cod==='on'?'placed':'pending'
        let orderObj={
            deliveryDetails:{
                phone:order.phone,
                address:order.address,
                post_code:order.post_code
            },
            userId:objectId(order.userId),
            PaymentMethod:order.cod,
            products:products,
            totalAmount:total,
            status:status,
            date:new Date()
        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
            resolve(response.insertedId)
        })
    })


},
getCartProductList:(userId)=>{
    return new Promise(async(resolve, reject) => {
        console.log(userId);
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        console.log(cart);
        resolve(cart.products)
        
    })
},
getUserOrders:(userId)=>{
    return  new Promise(async(resolve, reject) => {
        console.log(userId);
        let orders=await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).toArray()
        console.log(orders);
        resolve(orders)
    })
},
getOrderProducts:(orderId)=>{
    return new Promise(async(resolve, reject) => {
        let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{_id:new objectId(orderId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                }
            },
             {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            }
        
        ]).toArray()
        console.log(orderItems);
        resolve(orderItems)
    })

},
getOneuserDetails:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
            resolve(user)
        })     
    })
},
generateRazorpay:(orderId,total)=>{
    return new Promise((resolve, reject) => {
        var options={
            amount:total*100,
                currency:"INR",
                receipt:""+orderId
        };
        instance.orders.create(options,function(err,order){
            if(err){
                console.log(err);
            }else{
            console.log("new order :",order);
            resolve(order);
        }
        });
        
    })
}

}
//


    
