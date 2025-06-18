const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph } = require('docx');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const mammoth = require('mammoth');
const puppeteer = require('puppeteer');
const morgan = require('morgan');
const fs = require('fs');
const { execFile } = require('child_process');
const os = require('os');


const app = express();
const PORT = process.env.PORT || 5500;

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

// Text to PDF
app.post('/api/pdf', (req, res) => {
  const { text, fontSize, textAlign } = req.body;
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  doc.pipe(res);
  doc.fontSize(Number(fontSize) || 12).text(text || '', { align: textAlign || 'left' });
  doc.end();
});

// PDF to DOCX
app.post('/api/pdf-to-docx', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');

  // Create temp file paths
  const tmpDir = os.tmpdir();
  const pdfPath = path.join(tmpDir, `input_${Date.now()}.pdf`);
  const docxPath = path.join(tmpDir, `output_${Date.now()}.docx`);

  try {
    // Write PDF buffer to temp file
    fs.writeFileSync(pdfPath, req.file.buffer);

    // Call the Python script
    await new Promise((resolve, reject) => {
      execFile('python3', [
        path.join(__dirname, 'pdf2docx_convert.py'),
        pdfPath,
        docxPath
      ], (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return reject(error);
        }
        resolve();
      });
    });

    // Read the DOCX file and send it
    const docxBuffer = fs.readFileSync(docxPath);
    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(docxBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to convert PDF to DOCX.');
  } finally {
    // Clean up temp files
    fs.unlink(pdfPath, () => {});
    fs.unlink(docxPath, () => {});
  }
});

// DOCX to PDF (Mammoth + Puppeteer, in-memory)
app.post('/api/docx-to-pdf', upload.single('docx'), async (req, res) => {
  if (!req.file) return res.status(400).send('No DOCX file uploaded.');
  try {
    // Convert DOCX buffer to HTML
    const { value: html } = await mammoth.convertToHtml({ buffer: req.file.buffer });

    // Launch Puppeteer and generate PDF from HTML
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Send PDF buffer as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to convert DOCX to PDF.');
  }
});

// PDF to Text
app.post('/api/pdf-to-text', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text || '';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.txt');
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to extract text from PDF.');
  }
});

// PDF to Image (returns PNG of first page, placeholder)
app.post('/api/pdf-to-image', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');
  // Placeholder: returns a 1x1 transparent PNG
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.png');
  res.end(Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' +
    '1f15c4890000000a49444154789c6360000002000100', 'hex'));
});

// Image to PDF
app.post('/api/image-to-pdf', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No image file uploaded.');
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  doc.pipe(res);
  try {
    doc.image(req.file.buffer, { fit: [500, 700], align: 'center', valign: 'center' });
    doc.end();
  } catch (err) {
    res.status(500).send('Failed to convert image to PDF.');
    doc.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
