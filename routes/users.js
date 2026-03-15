const express = require('express');
const router = express.Router();
const User = require('../models/user');

// CREATE User
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// GET ALL Users (not deleted)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).populate('role');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// POST /enable - Enable user by email and username
router.post('/enable', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).send({ message: 'Email and username are required' });
    }
    const user = await User.findOne({ email, username, isDeleted: false });
    if (!user) return res.status(404).send({ message: 'User not found or deleted' });
    user.status = true;
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// POST /disable - Disable user by email and username
router.post('/disable', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).send({ message: 'Email and username are required' });
    }
    const user = await User.findOne({ email, username, isDeleted: false });
    if (!user) return res.status(404).send({ message: 'User not found or deleted' });
    user.status = false;
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// GET User by ID (not deleted)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(user);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
});

// UPDATE User by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// SOFT DELETE User by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!deleted) return res.status(404).send({ message: 'User not found' });
    res.status(200).send(deleted);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
