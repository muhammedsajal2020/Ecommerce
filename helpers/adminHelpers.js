var db=require('../config/connection')
var collection=require('../config/collections')
const collections = require('../config/collections')

module.exports={
    
    insertProducts:(productDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails)
        })
    },
    adminAcLogin:(admindata)=>{
        return new Promise((resolve, reject) => {
            
        })
    },
    getAllorders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                resolve(orders)      
        })
    }
}