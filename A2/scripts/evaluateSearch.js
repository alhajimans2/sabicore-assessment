require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { getEmbedding } = require('../services/embeddingService');
const { rankBySimilarity } = require('../services/searchService');

const prisma = new PrismaClient();

const TEST_CASES = [
  {
    query: 'early sepsis detection from emergency triage notes',
    expectation: 'Top results should mention sepsis detection and triage/clinical notes.',
  },
  {
    query: 'adverse drug event detection in electronic health records',
    expectation: 'Top results should focus on adverse drug events and EHR-based extraction.',
  },
  {
    query: 'patient readmission risk prediction using clinical text',
    expectation: 'Top results should discuss readmission or mortality prediction from notes/EHR text.',
  },
];

function looksReasonable(results, query) {
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);

  const topText = results
    .slice(0, 3)
    .map((r) => `${r.title} ${r.abstract}`.toLowerCase())
    .join(' ');

  const matches = words.filter((w) => topText.includes(w)).length;
  return matches >= 2;
}

async function main() {
  const abstracts = await prisma.abstract.findMany();

  if (abstracts.length === 0) {
    throw new Error('No embedded abstracts found. Run `npm run embed` first.');
  }

  console.log('A2 evaluation: top-5 semantic search results\n');

  for (const testCase of TEST_CASES) {
    const embedding = await getEmbedding(testCase.query);
    const ranked = rankBySimilarity(embedding, abstracts, 5);

    console.log(`Query: ${testCase.query}`);
    console.log(`Expectation: ${testCase.expectation}`);

    ranked.forEach((item, index) => {
      console.log(
        `${index + 1}. [${item.score.toFixed(4)}] ${item.title} (${item.year || 'n/a'})`
      );
    });

    const verdict = looksReasonable(ranked, testCase.query)
      ? 'Yes, the top results look semantically aligned.'
      : 'Partially; consider improving corpus quality or retrieval strategy.';

    console.log(`Makes sense? ${verdict}\n`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error.message || error);
    await prisma.$disconnect();
    process.exit(1);
  });
