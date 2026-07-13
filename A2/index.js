require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getEmbedding } = require('./services/embeddingService');
const { rankBySimilarity } = require('./services/searchService');

const app = express();
const prisma = new PrismaClient();

app.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();

    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required.' });
    }

    const queryEmbedding = await getEmbedding(q);
    const abstracts = await prisma.abstract.findMany();
    const ranked = rankBySimilarity(queryEmbedding, abstracts, 5);

    return res.json({ query: q, count: ranked.length, results: ranked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(3001, () => console.log('A2 running on port 3001'));
