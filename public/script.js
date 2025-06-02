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

// ...existing code...

// Modal logic
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

document.addEventListener('DOMContentLoaded', function() {
  // ...existing code...

  // Hamburger menu logic
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
});

// ...existing code...

/* Sign Up/In modal logic
const signUpModal = document.getElementById('signUpModal');
const signInModal = document.getElementById('signInModal');
const openSignUp = document.getElementById('openSignUp');
const openSignIn = document.getElementById('openSignIn');
const closeSignUp = document.getElementById('closeSignUp');
const closeSignIn = document.getElementById('closeSignIn');

openSignUp.onclick = (e) => { e.preventDefault(); signUpModal.style.display = 'block'; };
openSignIn.onclick = (e) => { e.preventDefault(); signInModal.style.display = 'block'; };
closeSignUp.onclick = () => signUpModal.style.display = 'none';
closeSignIn.onclick = () => signInModal.style.display = 'none';
*
/ Close modal when clicking outside modal content
window.addEventListener('click', function(event) {
  if (event.target === signUpModal) signUpModal.style.display = 'none';
  if (event.target === signInModal) signInModal.style.display = 'none';
});*/