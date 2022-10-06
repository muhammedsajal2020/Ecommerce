var db=require('../config/connection')
var collection=require('../config/collections')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:(productDetails)=>{
        db.get().collection('product').insertOne(productDetails)
    
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            
        })
    },

    //
    //  
    //   getCartProducts:(userId)=>{
    //     return new Promise( async(resolve, reject) => {
    //         let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
    //             {
    //                 $match:{user:objectId(userId)}
    //             },
    //             {
    //                 $lookup:{
    //                     from:collection.PRODUCT_COLLECTION,
    //                     let:{prodList:'$products'},
    //                     pipeline:[
    //                         {
    //                             $match:{
    //                                 $expr:{
    //                                     $in:['$_id',"$$prodList"]

                                        
    //                                 }
    //                             }
    //                         }

    //                     ],
    //                     as:'cartItems'
    //                 }
    //             }
    //         ]).toArray()
    //             resolve(cartItems[0].cartItems)
            
    //     })
    // }
    //
    deleteProduct:(prodId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
            
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    product_id:proDetails.product_id,
                    product_name:proDetails.product_name,
                    product_description:proDetails.product_description,
                    product_price:proDetails.product_price,
                    Brand_name:proDetails.Brand_name,
                    available_quantity:proDetails.available_quantity
                }
            }).then((response)=>{
               resolve() 
            })
        })

    }
}
//
//  insertProducts:(productDetails)=>{
//     return new Promise((resolve, reject) => {
//         db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails)
//     })
// }  