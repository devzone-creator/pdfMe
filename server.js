const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() });

// Minimal request logger in non-production to reduce startup I/O
if (process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (keeps uptime monitors happy)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Homepage
app.get('/', (req, res) => {
  res.render('index');
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Text to PDF conversion (lazy-load pdfkit)
app.post('/api/pdf', (req, res) => {
  const PDFDocument = require('pdfkit');
  const { text, fontSize, textAlign } = req.body;
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  doc.pipe(res);
  doc.fontSize(Number(fontSize) || 12).text(text || '', { align: textAlign || 'left' });
  doc.end();
});

// PDF to DOCX conversion (lazy-load heavy libs only when needed)
app.post('/api/pdf-to-docx', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');

  try {
    const pdfParse = require('pdf-parse');
    const axios = require('axios');
    const { Document, Packer, Paragraph } = require('docx');

    // Try to extract text from PDF
    const data = await pdfParse(req.file.buffer);

    if (data.text && data.text.trim().length > 0) {
      // Text-based PDF: convert using docx library
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
      // Image-based PDF: use PDF.co API for conversion
      const pdfBase64 = req.file.buffer.toString('base64');
      const response = await axios.post(
        'https://api.pdf.co/v1/pdf/convert/to/doc',
        {
          name: 'converted.docx',
          file: pdfBase64,
        },
        {
          headers: {
            'x-api-key': process.env.PDF_CO_API_KEY || "sample@sample.com_123a4b567c890d123e456f789g01",
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
    console.error('PDF to DOCX error:', err);
    res.status(500).send('Failed to convert PDF to DOCX.');
  }
});

// PDF to Text conversion (lazy-load pdf-parse)
app.post('/api/pdf-to-text', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');

  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(req.file.buffer);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.txt');
    res.send(data.text || '');
  } catch (err) {
    console.error('PDF to Text error:', err);
    res.status(500).send('Failed to extract text from PDF.');
  }
});

// Feedback email endpoint (lazy-load nodemailer)
app.post('/api/feedback', express.json(), async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const nodemailer = require('nodemailer');

  // Configure transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'frenzyfile@gmail.com',
      pass: process.env.GMAIL_PASSWORD || 'fhah sviq pwzy ywnr'
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.GMAIL_USER || 'frenzyfile@gmail.com',
    subject: `FileFrenzy Feedback from ${name}`,
    text: `Name: ${name}\n\n${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Feedback sent!' });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ success: false, message: 'Failed to send feedback.' });
  }
});

// DOCX to PDF conversion using Pandoc
app.post('/api/docx-to-pdf-pandoc', upload.single('docx'), async (req, res) => {
  if (!req.file) return res.status(400).send('No DOCX file uploaded.');

  const tmpDir = os.tmpdir();
  const docxPath = path.join(tmpDir, `input_${Date.now()}.docx`);
  const pdfPath = path.join(tmpDir, `output_${Date.now()}.pdf`);

  try {
    // Write DOCX buffer to temp file
    fs.writeFileSync(docxPath, req.file.buffer);

    // Convert DOCX to PDF using Pandoc
    await new Promise((resolve, reject) => {
      execFile('pandoc', [docxPath, '-o', pdfPath, '--pdf-engine=xelatex'], (error, stdout, stderr) => {
        if (error) {
          console.error('Pandoc error:', stderr);
          return reject(error);
        }
        resolve();
      });
    });

    // Read and send the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('DOCX to PDF error:', err);
    res.status(500).send('Failed to convert DOCX to PDF with Pandoc.');
  } finally {
    // Clean up temp files
    fs.unlink(docxPath, () => {});
    fs.unlink(pdfPath, () => {});
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
