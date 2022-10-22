let db = require("../config/connection");
let collection = require("../config/collections");
const async = require("hbs/lib/async");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addCoupon: (coupon, callback) => {
    try {
      db.get()
        .collection("coupon")
        .insertOne(coupon)
        .then((data) => {
          callback(data.insertedId);
        });
    } catch (error) {
      reject(error)
    }
  },
  getAllCoupon: () => {
    return new Promise(async (resolve, reject) => {
    try {
     
        let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray();
        resolve(coupons)
     
    } catch (error) {
      reject(error)
    }
  })
  },
  
}