const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const path = require('path');
const mammoth = require('mammoth');
const puppeteer = require('puppeteer');
const morgan = require('morgan');
const fs = require('fs');
const { execFile } = require('child_process');
const os = require('os');
const nodemailer = require('nodemailer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph } = require('docx');


const app = express();
const PORT = process.env.PORT || 5500;

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

// Log received file information (for debugging)
app.use((req, res, next) => {
  console.log('Received file:', req.file ? req.file.originalname : 'none', 'size:', req.file ? req.file.size : 0);
  next();
});

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

  try {
    // Try to extract text
    const data = await pdfParse(req.file.buffer);

    if (data.text && data.text.trim().length > 0) {
      // Text-based PDF: convert using docx
      const doc = new Document({
        sections: [{
          properties: {},
          children: data.text.split('\n').map(line => new Paragraph(line)),
        }],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      return res.send(docxBuffer);
    } else {
      // Not text-based: use PDF.co API
      const pdfBase64 = req.file.buffer.toString('base64');
      const response = await axios.post(
        'https://api.pdf.co/v1/pdf/convert/to/doc',
        {
          name: 'converted.docx',
          file: pdfBase64,
        },
        {
          headers: {
            'x-api-key': "sample@sample.com_123a4b567c890d123e456f789g01",
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.url) {
        // Download the DOCX file from PDF.co
        const docxResp = await axios.get(response.data.url, { responseType: 'arraybuffer' });
        res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        return res.send(docxResp.data);
      } else {
        return res.status(500).send('PDF.co conversion failed.');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to convert PDF to DOCX.');
  }
});

// PDF to Text conversion endpoint
app.post('/api/pdf-to-text', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');

  try {
    const data = await pdfParse(req.file.buffer);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.txt');
    res.send(data.text || '');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to extract text from PDF.');
  }
});

// Feedback endpoint
app.post('/api/feedback', express.json(), async (req, res) => {
  const { name, email, message } = req.body;

  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'frenzyfile@gmail.com',
      pass: 'fhah sviq pwzy ywnr'
    }
  });

  const mailOptions = {
    from: email,
    to: 'frenzyfile@gmail.com',
    subject: `FileFrenzy Feedback from ${name}`,
    text: `Name: ${name}\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Feedback sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send feedback.' });
  }
});

// DOCX to PDF using Pandoc (temp files)
app.post('/api/docx-to-pdf-pandoc', upload.single('docx'), async (req, res) => {
  if (!req.file) return res.status(400).send('No DOCX file uploaded.');

  const tmpDir = os.tmpdir();
  const docxPath = path.join(tmpDir, `input_${Date.now()}.docx`);
  const pdfPath = path.join(tmpDir, `output_${Date.now()}.pdf`);

  try {
    // Write DOCX buffer to temp file
    fs.writeFileSync(docxPath, req.file.buffer);

    // Call Pandoc to convert DOCX to PDF
    await new Promise((resolve, reject) => {
      execFile('pandoc', [docxPath, '-o', pdfPath, '--pdf-engine=xelatex'], (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return reject(error);
        }
        resolve();
      });
    });

    // Read the PDF file and send it
    const pdfBuffer = fs.readFileSync(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to convert DOCX to PDF with Pandoc.');
  } finally {
    fs.unlink(docxPath, () => {});
    fs.unlink(pdfPath, () => {});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
DOCX to PDF (Mammoth + Puppeteer, in-memory)
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
 */