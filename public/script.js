document.addEventListener('DOMContentLoaded', function() {
  // Modal open/close logic
  const openFunctionModals = document.getElementById('openFunctionModals');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const successModal = document.getElementById('successModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');

  // Modal buttons and modals
  const modalMap = [
    { btn: 'textToPDFBtn', modal: 'textToPDFModal', close: 'closeTextToPDF' },
    { btn: 'pdfToDocxBtn', modal: 'pdfToDocxModal', close: 'closePdfToDocx' },
    { btn: 'docxToPdfBtn', modal: 'docxToPDFModal', close: 'closeDocxToPDF' },
    { btn: 'pdfToTextBtn', modal: 'pdfToTextModal', close: 'closePdfToText' },
    { btn: 'pdfToImageBtn', modal: 'pdfToImageModal', close: 'closePdfToImage' },
    { btn: 'imageToPdfBtn', modal: 'imageToPDFModal', close: 'closeImageToPDF' }
  ];

  if (openFunctionModals && modal) {
    openFunctionModals.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = 'block';
    });
  }
  if (closeModal && modal) {
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
  if (closeSuccessModal && successModal) {
    closeSuccessModal.addEventListener('click', function() {
      successModal.style.display = 'none';
    });
  }

  // Handle all modal open/close
  modalMap.forEach(({ btn, modal: modalId, close }) => {
    const btnEl = document.getElementById(btn);
    const modalEl = document.getElementById(modalId);
    const closeEl = document.getElementById(close);
    if (btnEl && modal && modalEl) {
      btnEl.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'none';
        modalEl.style.display = 'block';
      });
    }
    if (closeEl && modalEl) {
      closeEl.addEventListener('click', function() {
        modalEl.style.display = 'none';
      });
    }
  });

  // Carousel Images
  const carouselImages = document.querySelectorAll('.carousel-img');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  let currentIndex = 0;

  function showImage(index) {
    carouselImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  if (prevBtn && nextBtn && carouselImages.length) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
      showImage(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      showImage(currentIndex);
    });

    setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselImages.length;
      showImage(currentIndex);
    }, 5000);
  }

  // Text to PDF Form
  const textToPDFForm = document.getElementById('textToPDFForm');
  if (textToPDFForm) {
    textToPDFForm.addEventListener('submit', async function(e) {
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

        if (successModal) {
          successModal.style.display = 'block';
          setTimeout(() => { successModal.style.display = 'none'; }, 3000);
        }
        document.getElementById('textToPDFModal').style.display = 'none';
      } else {
        alert('Failed to convert text to PDF.');
      }
    });
  }

  // PDF to DOCX Form
  const pdfToDocxForm = document.getElementById('pdfToDocxForm');
  if (pdfToDocxForm) {
    pdfToDocxForm.addEventListener('submit', async function(e) {
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
        document.getElementById('pdfToDocxModal').style.display = 'none';
      } else {
        alert('Failed to convert PDF to DOCX.');
      }
    });
  }

  // DOCX to PDF Form
  const docxToPDFForm = document.getElementById('docxToPDFForm');
  if (docxToPDFForm) {
    docxToPDFForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fileInput = document.getElementById('docxFile');
      if (!fileInput.files.length) {
        alert('Please select a DOCX file.');
        return;
      }
      const formData = new FormData();
      formData.append('docx', fileInput.files[0]);
      const response = await fetch('/api/docx-to-pdf', {
        method: 'POST',
        body: formData
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
        document.getElementById('docxToPDFModal').style.display = 'none';
      } else {
        alert('Failed to convert DOCX to PDF.');
      }
    });
  }

  // PDF to Text Form
  const pdfToTextForm = document.getElementById('pdfToTextForm');
  if (pdfToTextForm) {
    pdfToTextForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fileInput = document.getElementById('pdfToTextFile');
      if (!fileInput.files.length) {
        alert('Please select a PDF file.');
        return;
      }
      const formData = new FormData();
      formData.append('pdf', fileInput.files[0]);
      const response = await fetch('/api/pdf-to-text', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        document.getElementById('pdfToTextModal').style.display = 'none';
      } else {
        alert('Failed to extract text from PDF.');
      }
    });
  }

  // PDF to Image Form
  const pdfToImageForm = document.getElementById('pdfToImageForm');
  if (pdfToImageForm) {
    pdfToImageForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fileInput = document.getElementById('pdfToImageFile');
      if (!fileInput.files.length) {
        alert('Please select a PDF file.');
        return;
      }
      const formData = new FormData();
      formData.append('pdf', fileInput.files[0]);
      const response = await fetch('/api/pdf-to-image', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        document.getElementById('pdfToImageModal').style.display = 'none';
      } else {
        alert('Failed to convert PDF to Image.');
      }
    });
  }

  // Image to PDF Form
  const imageToPDFForm = document.getElementById('imageToPDFForm');
  if (imageToPDFForm) {
    imageToPDFForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fileInput = document.getElementById('imageToPDFFile');
      if (!fileInput.files.length) {
        alert('Please select an image file.');
        return;
      }
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      const response = await fetch('/api/image-to-pdf', {
        method: 'POST',
        body: formData
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
        document.getElementById('imageToPDFModal').style.display = 'none';
      } else {
        alert('Failed to convert Image to PDF.');
      }
    });
  }

  // Responsive Nav
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
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
  }

  // Feedback Modal Logic
  const feedModalBtn = document.getElementById('feedModal');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (feedModalBtn && feedbackModal) {
    feedModalBtn.addEventListener('click', function() {
      feedbackModal.style.display = 'block';
    });
  }
  if (closeModalBtn && feedbackModal) {
    closeModalBtn.addEventListener('click', function() {
      feedbackModal.style.display = 'none';
    });
  }

  // Optional: Close feedback modal when clicking outside modal content
  window.addEventListener('click', function(event) {
    if (event.target === feedbackModal) {
      feedbackModal.style.display = 'none';
    }
  });
});