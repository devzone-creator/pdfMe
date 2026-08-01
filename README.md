# 📄✨ file-frenzy: Privacy-First Document Conversion

**Your documents, your control. Convert PDFs offline with zero cloud uploads.**

🌍 **Live Demo**: [https://filefrenzy.onrender.com](https://filefrenzy.onrender.com)  
💻 **GitHub**: [devzone-creator/pdfMe](https://github.com/devzone-creator/pdfMe)  
📦 **Docker**: [Pull from Docker Hub](#docker-deployment)

---

## 🎯 What is file-frenzy?

**file-frenzy** is a free, open-source document conversion platform designed for people who value **privacy and control**. Unlike cloud-based converters that store your files on remote servers, file-frenzy processes everything **in-memory** — your PDFs never touch a database.

Perfect for:
- 👨‍💼 Professionals working with sensitive documents
- 🎓 Students converting assignments and research papers
- 🏢 Enterprises needing self-hosted document processing
- 👨‍💻 Developers building automation workflows
- 🔬 Researchers protecting confidential data

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **🔒 Privacy-First** | All conversions happen in-memory. No files stored on servers. |
| **⚡ Fast & Lightweight** | Processes files instantly. Minimal resource usage. |
| **🌐 Open Source** | MIT licensed. Full transparency. Community-driven. |
| **🔌 REST API** | Integrate into your workflows with simple HTTP requests. |
| **📦 Docker Ready** | Deploy on-premises. Full control over your infrastructure. |
| **💾 Batch Processing** | Convert multiple files simultaneously (Pro feature). |

---

## 🚀 Supported Conversions

```
📄 PDF → 📝 DOCX (Text & Scanned PDFs)
📄 PDF → 📃 TXT (Extract plain text)
📝 DOCX → 📄 PDF (Formatting preserved)
📝 Text → 📄 PDF (Beautiful formatting)
🖼️ Image → 📄 PDF (Coming soon)
```

---

## 🏗️ Why file-frenzy?

### vs. Cloud Converters (Smallpdf, ILovePDF, etc.)
| Aspect | file-frenzy | Cloud Converters |
|--------|-------------|------------------|
| Privacy | ✅ Local processing | ❌ Uploaded to servers |
| Cost | ✅ Free forever | ❌ Subscription required |
| Self-hosting | ✅ Yes | ❌ No |
| Data Retention | ✅ None | ❌ 24-48 hours |
| API Access | ✅ Yes | ❌ Paid tier only |

### vs. AI Tools (Gamma, Canva, etc.)
- **Focused**: file-frenzy is specifically for document conversion, not general design
- **Lightweight**: No complex UI/UX overhead — just conversions
- **No Training**: Your data isn't used for AI model training

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/devzone-creator/pdfMe.git
cd pdfMe

# 2. Install dependencies
npm install
pip3 install -r requirements.txt  # For Pandoc support (optional)

# 3. Create .env file
cp .env.example .env

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### Docker Deployment

```bash
# Build image
docker build -t file-frenzy .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  file-frenzy

# Access at http://localhost:3000
```

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/devzone-creator/pdfMe)

---

## 🔌 REST API Documentation

### Convert PDF to DOCX

**Endpoint**: `POST /api/pdf-to-docx`

```bash
curl -X POST -F "pdf=@document.pdf" \
  https://filefrenzy.onrender.com/api/pdf-to-docx \
  -o converted.docx
```

**Response**: DOCX file (binary)

---

### Convert PDF to Text

**Endpoint**: `POST /api/pdf-to-text`

```bash
curl -X POST -F "pdf=@document.pdf" \
  https://filefrenzy.onrender.com/api/pdf-to-text \
  -o extracted.txt
```

**Response**: Plain text file

---

### Convert Text to PDF

**Endpoint**: `POST /api/pdf`

```bash
curl -X POST https://filefrenzy.onrender.com/api/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, World!",
    "fontSize": 12,
    "textAlign": "left"
  }' \
  -o output.pdf
```

**Parameters**:
- `text` (string): Content to convert
- `fontSize` (number, optional): Font size (default: 12)
- `textAlign` (string, optional): left|center|right (default: left)

---

### Convert DOCX to PDF

**Endpoint**: `POST /api/docx-to-pdf-pandoc`

```bash
curl -X POST -F "docx=@document.docx" \
  https://filefrenzy.onrender.com/api/docx-to-pdf-pandoc \
  -o converted.pdf
```

**Response**: PDF file (binary)

---

### Health Check

**Endpoint**: `GET /health`

```bash
curl https://filefrenzy.onrender.com/health
# {"status":"ok","timestamp":"2026-08-01T10:00:00Z"}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Templating** | EJS |
| **Document Processing** | pdf-parse, pdfkit, mammoth, docx |
| **Deployment** | Docker, Render, Railway |
| **License** | MIT |

---

## 📊 Performance & Security

- ✅ **Memory Efficient**: In-memory processing, no disk writes
- ✅ **Size Limits**: 50MB max file size per upload
- ✅ **CORS Enabled**: Safe for browser-based requests
- ✅ **Health Monitoring**: Built-in `/health` endpoint for uptime checks
- ✅ **Error Handling**: Graceful failure with informative messages

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add: Your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Areas We Need Help With
- [ ] Batch file processing
- [ ] Image to PDF conversion
- [ ] Improved error handling
- [ ] Performance optimizations
- [ ] Unit & integration tests
- [ ] Better UI/UX for web interface

---

## 📝 Roadmap

### v1.1 (Next)
- ✅ REST API (in progress)
- ✅ Batch processing support
- [ ] Rate limiting for public API
- [ ] Enhanced error messages

### v1.2 (Future)
- [ ] Image to PDF conversion
- [ ] PDF compression
- [ ] OCR support (Tesseract.js)
- [ ] Multi-language document support

### v2.0 (Long-term)
- [ ] Web dashboard with usage analytics
- [ ] API key management
- [ ] Webhook support
- [ ] Serverless deployment (AWS Lambda, Google Cloud Functions)

---

## 🐛 Issue Reporting

Found a bug? Have a feature request?

👉 [Open an Issue](https://github.com/devzone-creator/pdfMe/issues)

Please include:
- What you were trying to do
- What went wrong
- Your OS, browser, and file format
- Steps to reproduce (if applicable)

---

## 📬 Contact & Support

- 📧 **Email**: [frenzyfile@gmail.com](mailto:frenzyfile@gmail.com)
- 💬 **GitHub Discussions**: [Start a discussion](https://github.com/devzone-creator/pdfMe/discussions)
- 🐦 **Twitter**: Share your experience with us!

---

## 📜 License

MIT License — See [LICENSE](LICENSE) file for details.

**You're free to use, modify, and distribute file-frenzy for personal or commercial projects.**

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [pdf-parse](https://github.com/modesty/pdf-parse) - PDF text extraction
- [pdfkit](http://pdfkit.org/) - PDF generation
- [mammoth.js](https://mammoth.readthedocs.io/) - DOCX conversion
- [docx](https://github.com/dolanmiu/docx) - DOCX generation
- [Express.js](https://expressjs.com/) - Web framework
- [Render](https://render.com/) - Hosting

---

**Made with 🚀 by the file-frenzy team**

Give us a ⭐ if you find this project useful!
