require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

app.post('/ingest', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded in field pdf' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const titleMatch = text.match(/Title:\s*(.+)/i);
    const abstractMatch = text.match(/Abstract:\s*([\s\S]+?)(?=\n\n|\n[A-Z])/i);
    const authorsMatch = text.match(/Authors?:\s*(.+)/i);
    const yearMatch = text.match(/(19|20)\d{2}/);
    const doiMatch = text.match(/10\.\d{4,9}\/[\-._;()/:A-Z0-9]+/i);

    const doi = doiMatch ? doiMatch[0] : null;

    if (doi) {
      const existing = await prisma.document.findUnique({ where: { doi } });
      if (existing) {
        fs.unlinkSync(req.file.path);
        return res.status(200).json({ message: 'Duplicate', document: existing });
      }
    }

    const document = await prisma.document.create({
      data: {
        doi,
        title: titleMatch ? titleMatch[1].trim() : 'Untitled',
        abstract: abstractMatch ? abstractMatch[1].trim() : null,
        authors: authorsMatch ? authorsMatch[1].trim() : null,
        year: yearMatch ? parseInt(yearMatch[0], 10) : null,
      },
    });

    fs.unlinkSync(req.file.path);
    return res.status(201).json({ message: 'Ingested', document });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(3000, () => console.log('B1 running on port 3000'));
