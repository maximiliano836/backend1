const express = require('express');
const router = express.Router();

// Página de inicio
router.get('/', (req, res) => {
  res.render('home', { title: 'Inicio' });
});

// Página de chat
router.get('/chat', (req, res) => {
  res.render('chat', { title: 'Chat en Tiempo Real' });
});

module.exports = router;