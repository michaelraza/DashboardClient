const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const redisClient = require('../config/redis');

// Route pour la page d'accueil
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, BillingState FROM salesforce.account');
    const accounts = result.rows;

    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
          }
          .banner {
            background-color: #004080; /* Couleur bleu sombre */
            color: white;
            padding: 20px;
          }
          table {
            margin: 20px auto;
            border-collapse: collapse;
            width: 80%;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #004080; /* Couleur bleu sombre */
            color: white;
          }
          button {
            background-color: #004080; /* Couleur bleu sombre */
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
          }
          button:hover {
            background-color: #003366; /* Couleur bleu plus foncé */
          }
          .logos {
            margin: 20px;
          }
          img {
            width: 50px;
            margin: 0 10px;
          }
          .input-group {
            margin: 20px;
          }
          input[type="number"] {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 80px;
          }
        </style>
      </head>
      <body>
        <div class="banner">
          <h1>Admin Dashboard</h1>
        </div>

        <h2>Liste des Comptes</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>État de Facturation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${accounts.map(account => `
              <tr>
                <td>${account.id}</td>
                <td>${account.name}</td>
                <td>${account.billingstate || 'N/A'}</td>
                <td>
                  <button onclick="window.location.href='/client/${account.id}'">Voir Détails</button>
                  <button onclick="window.location.href='/client/${account.id}/facture'">Ajouter Facture</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div class="logos">
          <img src="https://apprendre-la-programmation.net/images/deployer-application-heroku.png" alt="Heroku Logo">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKUEl0Gc3WX9m5ZMKGqhRoRHZ-plV19qYAmg&s" alt="Salesforce Logo">
          <img src="https://ps.w.org/redis-cache/assets/banner-1544x500.png?rev=2315420" alt="Redis Logo">
        </div>

        <div class="input-group">
          <input type="number" id="clientId" placeholder="Entrez un ID" min="1" required>
          <button onclick="goToClient()">Voir Client</button>
        </div>

        <div>
          <button onclick="window.location.href='/redis'">Insérer dans Redis</button>
        </div>

        <script>
          function goToClient() {
            const clientId = document.getElementById('clientId').value;
            if (clientId) {
              window.location.href = '/client/' + clientId;
            } else {
              alert('Veuillez entrer un ID valide.');
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    res.status(500).send('Erreur lors de la récupération des données.');
  }
});

module.exports = router;
