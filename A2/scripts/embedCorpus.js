require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getEmbedding } = require('../services/embeddingService');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'abstracts.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const corpus = JSON.parse(raw);

  for (const item of corpus) {
    const content = `${item.title}\n${item.authors || ''}\n${item.abstract}`;
    const embedding = await getEmbedding(content);

    await prisma.abstract.create({
      data: {
        title: item.title,
        authors: item.authors || null,
        year: item.year || null,
        abstract: item.abstract,
        embedding,
      },
    });

    console.log(`Embedded: ${item.title}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Embedding complete.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
