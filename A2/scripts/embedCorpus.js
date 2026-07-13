require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { getEmbedding } = require('../services/embeddingService');

const prisma = new PrismaClient();

async function main() {
  // Load the local seed corpus used for embedding generation.
  const dataPath = path.join(__dirname, '..', 'data', 'abstracts.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const corpus = JSON.parse(raw);

  // Reset corpus rows so repeated runs do not create duplicates.
  await prisma.abstract.deleteMany();

  // Embed each record and persist it in the database.
  for (const item of corpus) {
    // Concatenate key text fields to represent the document semantically.
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

  console.log(`Embedded ${corpus.length} abstracts.`);
}

main()
  .then(async () => {
    // Always close Prisma connections after successful completion.
    await prisma.$disconnect();
    console.log('Embedding complete.');
  })
  .catch(async (error) => {
    // Ensure cleanup also happens on failure.
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
