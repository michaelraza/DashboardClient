const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis'); // Assurez-vous que le chemin vers votre client Redis est correct

// Route pour afficher les détails d'un client
router.get('/:id', async (req, res) => {
  const clientId = req.params.id;
  try {
    const clientData = await redisClient.get(`client:${clientId}`);
    const invoicesData = await redisClient.get(`client:${clientId}:invoices`);

    let clientInfo = {};
    let invoices = [];

    if (clientData) {
      clientInfo = JSON.parse(clientData); // Parser la chaîne JSON
    }

    if (invoicesData) {
      invoices = JSON.parse(invoicesData); // Parser la chaîne JSON des factures
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Détails du Client</title>
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
            width: 70%;
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
          .button {
            background-color: #004080; /* Couleur bleu sombre */
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #003366; /* Couleur bleu plus foncé */
          }
        </style>
      </head>
      <body>
        <div class="banner">
          <h1>Détails du Client</h1>
        </div>
        <h2>Informations du Client</h2>
        <table>
          <tr><th>ID</th><td>${clientId}</td></tr>
          <tr><th>Nom</th><td>${clientInfo.name || 'N/A'}</td></tr>
          <tr><th>État de Facturation</th><td>${clientInfo.billingState || 'N/A'}</td></tr>
          <tr><th>Téléphone</th><td>${clientInfo.phone || 'N/A'}</td></tr>
        </table>

        <h2>Factures</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Prix Total</th>
              <th>Produits</th>
              <th>Réduction (%)</th>
              <th>TVA (%)</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(invoice => `
              <tr>
                <td>${new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                <td>${invoice.totalPrice.toFixed(2)} €</td>
                <td>${invoice.productList.join(', ')}</td>
                <td>${invoice.discount}</td>
                <td>${invoice.vat}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        
        <div><button class="button" onclick="window.location.href='/'">Retour à la liste des comptes</button></div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Erreur Redis :', err);
    res.status(500).send('Erreur lors de la récupération du client.');
  }
});

// Route pour le formulaire de création de facture
router.get('/:id/facture', async (req, res) => {
  const clientId = req.params.id;

  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Créer une Facture</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          padding: 20px;
        }
        .banner {
          background-color: #004080; /* Couleur bleu sombre */
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0;
        }
        .invoice-logo {
          width: 100px;
          margin: 20px auto;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px;
        }
        input {
          padding: 10px;
          margin: 5px;
          width: 80%; /* Utiliser 80% de la largeur pour les champs */
          max-width: 300px; /* Largeur maximale */
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        button {
          background-color: #004080; /* Couleur bleu sombre */
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s;
          font-size: 16px;
          width: 80%; /* Utiliser 80% de la largeur pour le bouton */
          max-width: 300px; /* Largeur maximale */
        }
        button:hover {
          background-color: #003366; /* Couleur bleu plus foncé */
        }
      </style>
    </head>
    <body>
      <div class="banner">
        <h1>Créer une Facture pour Client ID: ${clientId}</h1>
      </div>
      <img src="https://st4.depositphotos.com/18664664/23990/v/450/depositphotos_239901868-stock-illustration-invoice-icon-trendy-invoice-logo.jpg" alt="Logo Facture" class="invoice-logo">
      <div class="input-group">
        <input type="number" id="totalPrice" placeholder="Prix Total" required>
        <input type="text" id="productList" placeholder="Liste de Produits (virgule séparée)" required>
        <input type="number" id="discount" placeholder="Réduction (%)" required>
        <input type="number" id="vat" placeholder="TVA (%)" required>
        <button onclick="createInvoice('${clientId}')">Créer Facture</button>
      </div>
      <script>
        function createInvoice(clientId) {
          const totalPrice = document.getElementById('totalPrice').value;
          const productList = document.getElementById('productList').value;
          const discount = document.getElementById('discount').value;
          const vat = document.getElementById('vat').value;

          // Validation simple
          if (!totalPrice || !productList || !discount || !vat) {
            alert('Veuillez remplir tous les champs.');
            return;
          }

          fetch('/create-invoice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientId,
              totalPrice,
              productList: productList.split(',').map(item => item.trim()), // Assurez-vous de trim les espaces
              discount,
              vat,
            }),
          })
          .then(response => {
            if (response.ok) {
              alert('Facture créée avec succès !');
              window.location.href = '/client/' + clientId;
            } else {
              alert('Erreur lors de la création de la facture.');
            }
          })
          .catch(error => console.error('Erreur:', error));
        }
      </script>
    </body>
    </html>
  `);
});

// Exporter le routeur
module.exports = router;
