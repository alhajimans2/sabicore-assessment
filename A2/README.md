# A2 - Semantic Search over Research Abstracts

## Prerequisites
- Node.js 18+
- npm
- PostgreSQL database
- OpenAI API key

## Environment Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `OPENAI_API_KEY`.

Example:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
OPENAI_API_KEY="your_openai_api_key_here"
```

## Install
```bash
npm install
```

## Prepare Prisma Client and DB
```bash
npm run prisma:generate
npm run prisma:push
```

## Embed Corpus (50 abstracts)
```bash
npm run embed
```
This reads `data/abstracts.json`, generates embeddings, and stores vectors in PostgreSQL.

## Run Semantic Search API
```bash
npm start
```
Server runs on `http://localhost:3001`.

### Search Endpoint
- `GET /search?q=your free-text query`
- Returns top-5 most relevant abstracts using cosine similarity.

Example:
```bash
curl "http://localhost:3001/search?q=sepsis%20triage%20notes"
```

## Run Simple Evaluation (3 test queries)
```bash
npm run evaluate
```
This prints top-5 results for three predefined queries and a quick "makes sense" verdict.
