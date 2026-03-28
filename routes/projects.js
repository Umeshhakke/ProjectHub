const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

/* ======================
   🔐 AUTH MIDDLEWARE
====================== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/* ======================
   ➕ ADD PROJECT (ADMIN)
====================== */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, price, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price required' });
    }

    const project = await Project.create({
      name,
      description,
      price,
      image_url
    });

    res.json({
      message: 'Project added',
      projectId: project._id
    });

  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error adding project' });
  }
});

/* ======================
   📦 GET ALL PROJECTS
====================== */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching projects' });
  }
});

/* ======================
   🔍 GET PROJECT BY ID
====================== */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);

  } catch (err) {
    res.status(404).json({ message: 'Project not found' });
  }
});

module.exports = router;