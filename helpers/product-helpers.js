var db=require('../config/connection')
var collection=require('../config/collections')
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
    deleteProduct:(prodId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
            
        })
    }
}