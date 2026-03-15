var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')

/* READ ALL (đã có sẵn) */
router.get('/', async function(req, res) {
  let result = await productModel.find({})
  res.send(result);
});

/* READ BY ID */
router.get('/:id', async function(req, res) {
  try{
    let result = await productModel.findById(req.params.id)
    res.send(result)
  }catch(err){
    res.status(500).send(err.message)
  }
})

/* CREATE PRODUCT */
router.post('/', async function(req, res) {
  try{

    let newProduct = new productModel({
      title: req.body.title,
      slug: req.body.slug,
      price: req.body.price,
      description: req.body.description,
      images: req.body.images,
      category: req.body.category
    })

    let result = await newProduct.save()
    res.send(result)

  }catch(err){
    res.status(400).send(err.message)
  }
})

/* UPDATE PRODUCT */
router.put('/:id', async function(req, res) {
  try{

    let result = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
    )

    res.send(result)

  }catch(err){
    res.status(400).send(err.message)
  }
})

/* DELETE PRODUCT */
router.delete('/:id', async function(req, res) {
  try{

    let result = await productModel.findByIdAndDelete(req.params.id)

    res.send({
      message:"Delete success",
      data: result
    })

  }catch(err){
    res.status(500).send(err.message)
  }
})

module.exports = router;