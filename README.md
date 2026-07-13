# SabiCore Assessment - Alhaji Mansaray

I chose **F1**, **B1**, and **A2** for this assessment.

## How to run each solution
- **F1 (Frontend)**: cd F1 && npm install && npm run dev
- **B1 (Backend)**: cd B1 && npm install && node index.js
- **A2 (AI Search)**: cd A2 && npm install && npm run embed && npm start

Node 18+ and npm are required.

## A2 Notes (Semantic Search)
- Embedding model: `text-embedding-3-small` via OpenAI API.
- Storage: vectors are stored as JSON in PostgreSQL through Prisma.
- Retrieval: cosine similarity is computed in the Node.js application layer.
- Search endpoint: `GET /search?q=...` returns the **top 5** most relevant abstracts.

### Scale Path
Current implementation matches Sabi Core's app-layer similarity approach. For larger corpora, a pgvector migration is a straightforward scale path (vector column + ANN index like IVFFlat/HNSW), reducing retrieval latency and database transfer volume.

### Simple Evaluation (3 Test Queries)
1. Ensure database/env setup in `A2/.env` (`DATABASE_URL`, `OPENAI_API_KEY`) and run:
	`cd A2 && npm run embed && npm run evaluate`
2. The evaluation script runs these three queries and prints top-5 results plus a quick "Makes sense?" verdict:
	- `early sepsis detection from emergency triage notes`
	- `adverse drug event detection in electronic health records`
	- `patient readmission risk prediction using clinical text`