const textToPDFModal = document.getElementById('textToPDFModal');
const pdfToDocxModal = document.getElementById('pdfToDocxModal');
const openTextToPdf = document.getElementById('TextToPdfBtn');
const openPdfToDocx = document.getElementById('PdfToDocxBtn');
const closeTextToPDF = document.getElementById('closeTextToPDF');
const closePdfToDocx = document.getElementById('closePdfToDocx');

openTextToPdf.onclick = () => textToPDFModal.style.display = 'block';
openPdfToDocx.onclick = () => pdfToDocxModal.style.display = 'block';
closeTextToPDF.onclick = () => textToPDFModal.style.display = 'none';
closePdfToDocx.onclick = () => pdfToDocxModal.style.display = 'none';

// Close modal when clicking outside modal content
window.onclick = function(event) {
  if (event.target === textToPDFModal) textToPDFModal.style.display = 'none';
  if (event.target === pdfToDocxModal) pdfToDocxModal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', function() {
  const carouselImages = document.querySelectorAll('.carousel-img');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let currentIndex = 0;

  function showImage(index) {
    carouselImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
    showImage(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % carouselImages.length;
    showImage(currentIndex);
  });

  // Optional: Auto-slide every 5 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % carouselImages.length;
    showImage(currentIndex);
  }, 5000);
});


document.getElementById('textToPDFForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const text = document.getElementById('textInput').value;
  const fontSize = document.querySelector('input[name="fontSize"]:checked').value;
  const textAlign = document.querySelector('input[name="textAlign"]:checked').value;

  const response = await fetch('/api/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, fontSize, textAlign })
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    // Show modal success message (if using modal)
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    setTimeout(() => { modal.style.display = 'none'; }, 3000);
  } else {
    alert('Failed to convert text to PDF.');
  }
});


document.getElementById('pdfToDocxForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('pdfFile');
  if (!fileInput.files.length) {
    alert('Please select a PDF file.');
    return;
  }
  const formData = new FormData();
  formData.append('pdf', fileInput.files[0]);
  const response = await fetch('/api/pdf-to-docx', {
    method: 'POST',
    body: formData
  });
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.docx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } else {
    alert('Failed to convert PDF to DOCX.');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
});