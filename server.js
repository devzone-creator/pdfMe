const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph } = require('docx');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5500;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.post('/api/pdf', (req, res) => {
  const { text, fontSize, textAlign } = req.body;
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');

  doc.pipe(res);

  const size = parseInt(fontSize, 10) || 12;
  const align = ['left', 'center', 'right'].includes(textAlign) ? textAlign : 'left';

  doc.fontSize(size).text(text || 'No content provided.', {
    align: align
  });

  doc.end();
});



app.post('/api/pdf-to-docx', upload.single('pdf'), async (req, res) => {
  const pdfPath = req.file.path;
  const dataBuffer = fs.readFileSync(pdfPath);

  try {
    const data = await pdfParse(dataBuffer);
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph(data.text)],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.unlinkSync(pdfPath);

    res.setHeader('Content-Disposition', 'attachment; filename=converted.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to convert PDF to DOCX');
  }
});
// DOCX to PDF
app.post('/api/docx-to-pdf', upload.single('docx'), async (req, res) => {
  if (!req.file) return res.status(400).send('No DOCX file uploaded.');
  const docxPath = req.file.path;
  // For demo: just return a blank PDF (implement real conversion as needed)
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  doc.pipe(res);
  doc.text('DOCX to PDF conversion not implemented.');
  doc.end();
  fs.unlink(docxPath, () => {});
});

// PDF to Text
app.post('/api/pdf-to-text', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');
  const pdfPath = req.file.path;
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    res.type('text/plain').send(data.text);
  } catch (err) {
    res.status(500).send('Failed to extract text from PDF.');
  } finally {
    fs.unlink(pdfPath, () => {});
  }
});


// PDF to Image (returns PNG of first page, placeholder)
app.post('/api/pdf-to-image', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');
  const pdfPath = req.file.path;
  // For demo: return a blank PNG (implement real conversion as needed)
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.png');
  // Send a 1x1 transparent PNG
  res.end(Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' +
    '1f15c4890000000a49444154789c6360000002000100', 'hex'));
  fs.unlink(pdfPath, () => {});
});

// Image to PDF
app.post('/api/image-to-pdf', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No image file uploaded.');
  const imagePath = req.file.path;
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');
  doc.pipe(res);
  try {
    doc.image(imagePath, { fit: [500, 700], align: 'center', valign: 'center' });
    doc.end();
  } catch (err) {
    res.status(500).send('Failed to convert image to PDF.');
    doc.end();
  } finally {
    fs.unlink(imagePath, () => {});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
