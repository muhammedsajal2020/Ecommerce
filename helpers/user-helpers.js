var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId
const { ObjectId } = require('mongodb')
const { response } = require('../app')
const Razorpay = require('razorpay');
const { log } = require('console')
const async = require('hbs/lib/async')
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
        // let status=order.cod==='on'?'placed':'pending'
        const status =
                order.paymentMethod === "COD"
                    ? "placed"
                ????????:??"Pending";
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
//  getOrderProducts:(orderId)=>{
//     return new Promise(async(resolve, reject) => {
//         let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
//             {
//                 $match:{_id:new objectId(orderId)}
//             },
//             {
//                 $unwind:'$products'
//             },
//             {
//                 $project:{
//                     item:'$products.item',
//                     quantity:'$products.quantity',
//                 }
//             },
//              {
//                 $lookup:{
//                     from:collection.PRODUCT_COLLECTION,
//                     localField:'item',
//                     foreignField:'_id',
//                     as:'product'
//                 }
//             },
//             {
//                 $project:{
//                     item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
//                 }
//             }
        
//         ]).toArray()
//         console.log(orderItems);
//         resolve(orderItems)
//     })

// },
getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
        try {

            orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$status',
                        date: '$date',
                        totalAmount: '$totalAmount',
                      

                    }
                },
                {
                    $lookup: {
                        from:'product',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        totalAmount: 1, status: 1, data: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(orderItems)



        } catch (error) {
            reject(error)
        }
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
},
verifyPayment:(details)=>{
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256','Ll7EcfrmETS6DQeeRNOtdkjF')
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac=hmac.digest('hex')
        if (hmac==details['payment[razorpay_signature]']){
            resolve()
        }else{
            reject()
        }
    })
},
changePaymentStatus:(orderId)=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'placed'
            }
        }).then(()=>{
            resolve()
        })
    })

},
orderShipped:(orderId)=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'shipped'
            }
        }).then(()=>{
            resolve()
        })
    })

},

deleteWish:(id,pid)=>{
    console.log(id,pid,'mm');
    return new Promise((resolve,reject)=>{
    try {
       
            db.get().collection(collection.FAVOURITE_COLLECTION).updateOne({_id:objectId(id)},
            {
                $pull:{products:{item:objectId(pid)}}
            }
            ).then((response)=>{
                resolve({deleteProduct:true})
            })
       
    } catch (error) {
        reject(error)
    }
})
},
deleteCart:(id,pid)=>{
    console.log(id,pid,'ddddddddddd');
    return new Promise((resolve,reject)=>{
    try {
       
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(id)},
            {
                $pull:{products:{item:objectId(pid)}}
            }
            ).then((response)=>{
                resolve({deleteProduct:true})
            })
       
    } catch (error) {
        reject(error)
    }
})
}, editUserDetails:(userId,userDetails)=>{
    return new Promise(async(resolve, reject) => {
        userDetails.password = await bcrypt.hash(userDetails.password, 10)
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
            $set:{
                name:userDetails.name,
                second_name:userDetails.second_name,
                email:userDetails.email,
                phone_number:userDetails.phone_number,
                password:userDetails.password,
                confirmPassword:userDetails.confirmPassword
            }
        }).then((response)=>{
           resolve() 
        })
    })

},
// db.get().collection(collection.USER_COLLECTION).update({_id:objectId(userId)},
// { $set: { address: addressData } }

addAddress:(userId,addressData)=>{
    console.log('llllllllllll',addressData);
    return new Promise((resolve, reject) => {

      
   db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
      {
        $push: { 'address': addressData,}
      }
                     
         ).then((response)=>{
          resolve()
         })
        
    })

},
// getAllAddress: (userId) => {
//     return new Promise(async (resolve, reject) => {
//     try {
     
//         let alladdress = await db.get().collection(collection.USER_COLLECTION).find().toArray();
//         resolve(alladdress)
//         console.log('all address',alladdress);
     
//     } catch (error) {
//       reject(error)
//     }
//   })
//   },
getAllAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            orderItems = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: new objectId(userId) }
                },
                {
                    $unwind: '$address'
                },
                {
                    $project: {
                        address1: '$address.address1',
                        towncity: '$address.town/city',
                        state: '$address.state',
                        district: '$address.district',
                        postcode: '$address.postcode',
                      

                    }
                },
                {
                    $lookup: {
                        from:'user',
                        localField: 'address1',
                        foreignField: '_id',
                        as: 'alladdress'
                    }
                },
                {
                    $project: {
                        address1: 1, towncity: 1, state: 1, item: 1, district: 1,postcode:1, alladdress: { $arrayElemAt: ['$alladdress', 0] }
                    }
                }

            ]).toArray()

            resolve(orderItems)



        } catch (error) {
            reject(error)
        }
    })

},
editUserAddress : (userId, address, addressId) => {
    return new Promise((resolve, reject) => {
    try {
   
            db.get().collection(collections.USER_collection).updateOne({ _id: objectId(userId), 'Addresses._addId': addressId },


                {
                    $set: {

                        "Addresses.$.Name": address.Name,
                        "Addresses.$.Email": address.Email,
                        "Addresses.$.Building_Name": address.Building,
                        "Addresses.$.Street_Name": address.Street,
                        "Addresses.$.City": address.City,
                        "Addresses.$. District": address.District,
                        "Addresses.$.Country": address.Country,
                        "Addresses.$.State": address.State
                    }
                }
            ).then((response) => {
                resolve(response)
            })

    
    } catch (error) {
        reject(error)
    }
})




}

}



    
