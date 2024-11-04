const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis'); // Assurez-vous que le chemin vers votre client Redis est correct

// Route pour créer une facture
router.post('/create-invoice', async (req, res) => {
  const { clientId, totalPrice, productList, discount, vat } = req.body;

  try {
    // Vérifier que tous les champs nécessaires sont fournis
    if (!clientId || !totalPrice || !productList || discount === undefined || vat === undefined) {
      return res.status(400).send('Tous les champs doivent être remplis.');
    }

    // Créer l'objet de facture
    const invoice = {
      totalPrice: parseFloat(totalPrice),
      productList: productList.split(',').map(item => item.trim()), // Transforme la liste de produits en tableau
      discount: parseFloat(discount) || 0,
      vat: parseFloat(vat) || 0,
      date: new Date().toISOString(),
    };

    // Récupérer les factures existantes du client
    const redisKey = `client:${clientId}:invoices`;
    const existingInvoices = await redisClient.get(redisKey);
    const invoices = existingInvoices ? JSON.parse(existingInvoices) : [];

    // Ajouter la nouvelle facture
    invoices.push(invoice);

    // Stocker le tableau mis à jour dans Redis
    await redisClient.set(redisKey, JSON.stringify(invoices));

    res.status(200).send('Facture créée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création de la facture :', error);
    res.status(500).send('Erreur lors de la création de la facture.');
  }
});

// Exporter le routeur
module.exports = router;
