const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph } = require('docx');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('home')
})

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
