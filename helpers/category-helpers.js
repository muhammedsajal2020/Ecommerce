var db=require('../config/connection')
var collection=require('../config/collections')
const collections = require('../config/collections')


module.exports={
    
    insertCategory:(categoryDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(categoryDetails)
        })
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let categorys =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(categorys)
            
        })
    } 
}