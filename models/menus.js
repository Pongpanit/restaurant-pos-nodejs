const mongoose = require('mongoose')

let menuSchema = mongoose.Schema({
    name:String,
    price:Number,
    image:String,
    category:String,
    description:String,
    status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'}
})

module.exports = mongoose.model("Menu", menuSchema);

module.exports.saveProduct = function(model, data){
    model.save(data);
}