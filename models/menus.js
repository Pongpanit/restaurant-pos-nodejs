const mongoose = require('mongoose')

// ออกแบบ Schema
let menuSchema = mongoose.Schema({
    name:String,
    price:Number,
    image:String,
    category:String,
    description:String,
    status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'}
})

// สร้างและส่งออก Model
module.exports = mongoose.model("Menu", menuSchema);

// สร้างฟังก์ชันบันทึกข้อมูล
module.exports.saveProduct = function(model, data){
    model.save(data);
}