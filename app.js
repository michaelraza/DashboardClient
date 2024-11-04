const express = require('express');
const clientRouter = require('./routes/client'); // Chemin vers ton fichier client.js
const invoiceRouter = require('./routes/invoice'); // Chemin vers ton fichier invoice.js
const mainRouter = require('./routes/main'); // Chemin vers ton fichier main.js
const redisClient = require('./config/redis'); // Chemin vers la configuration Redis
const app = express();

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utiliser les différents routeurs
app.use('/client', clientRouter);
app.use('/invoice', invoiceRouter); // Exemple d'URL pour accéder aux factures
app.use('/', mainRouter); // Route principale

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
