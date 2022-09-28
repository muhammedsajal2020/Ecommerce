var db=require('../config/connection')
var collection=require('../config/collections')
module.exports={
    addProduct:(productDetails)=>{
        db.get().collection('product').insertOne(productDetails)
    
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            
        })
    }
}