const express = require('express');
const router = express.Router();
const Role = require('../models/role');
const User = require('../models/user');

// CREATE Role
router.post('/', async (req, res) => {
  try {
    const role = new Role(req.body);
    const result = await role.save();
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// GET ALL Roles (not deleted)
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false });
    res.status(200).send(roles);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET all users by role id (not deleted) - Place before GET /:id
router.get('/:id/users', async (req, res) => {
  try {
    const users = await User.find({ role: req.params.id, isDeleted: false }).populate('role');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET Role by ID (not deleted)
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
    if (!role) return res.status(404).send({ message: 'Role not found' });
    res.status(200).send(role);
  } catch (err) {
    res.status(404).send({ message: err.message });
  }
});

// UPDATE Role by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send({ message: 'Role not found' });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// SOFT DELETE Role by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Role.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!deleted) return res.status(404).send({ message: 'Role not found' });
    res.status(200).send(deleted);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
