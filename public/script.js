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
  const textToPDFModal = document.getElementById('textToPDFModal');
  if (textToPDFForm && textToPDFModal) {
    textToPDFForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      textToPDFModal.style.display = 'none'; // Hide modal immediately

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
  const pdfToDocxModal = document.getElementById('pdfToDocxModal');
  if (pdfToDocxForm && pdfToDocxModal) {
    pdfToDocxForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      pdfToDocxModal.style.display = 'none'; // Hide modal immediately

      const fileInput = document.getElementById('pdfFile');
      if (!fileInput.files.length) return;

      // Show loading
      document.getElementById('loadingModal').style.display = 'block';

      const formData = new FormData();
      formData.append('pdf', fileInput.files[0]);
      const res = await fetch('/api/pdf-to-docx', { method: 'POST', body: formData });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.docx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setTimeout(() => {
          document.getElementById('loadingModal').style.display = 'none';
          showSuccessModal('DOCX successfully generated and downloaded.');
        }, 6000);
      } else {
        document.getElementById('loadingModal').style.display = 'none';
        alert('Conversion failed.');
      }
    });
  }

  // DOCX to PDF Form
  const docxToPDFForm = document.getElementById('docxToPDFForm');
  const docxToPDFModal = document.getElementById('docxToPDFModal');
  if (docxToPDFForm && docxToPDFModal) {
    docxToPDFForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      docxToPDFModal.style.display = 'none'; // Hide modal immediately

      const fileInput = document.getElementById('docxFile');
      if (!fileInput.files.length) return;

      // Show loading spinner/message
      document.getElementById('loadingModal').style.display = 'block';

      const formData = new FormData();
      formData.append('docx', fileInput.files[0]);
      const res = await fetch('/api/docx-to-pdf-pandoc', { method: 'POST', body: formData });

      if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          // Wait 5-8 seconds (simulate lazy loading)
          setTimeout(() => {
              document.getElementById('loadingModal').style.display = 'none';
              showSuccessModal('PDF successfully generated and downloaded.');
          }, 6000); // 6000 ms = 6 seconds (adjust as needed)
      } else {
          document.getElementById('loadingModal').style.display = 'none';
          alert('Conversion failed.');
      }
    });
  }

  const pdfToTextForm = document.getElementById('pdfToTextForm');
  const pdfToTextModal = document.getElementById('pdfToTextModal');
  if (pdfToTextForm && pdfToTextModal) {
    pdfToTextForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      pdfToTextModal.style.display = 'none'; // Hide modal immediately

      const fileInput = document.getElementById('pdfToTextFile');
      if (!fileInput.files.length) return;

      // Show loading
      document.getElementById('loadingModal').style.display = 'block';

      const formData = new FormData();
      formData.append('pdf', fileInput.files[0]);
      const res = await fetch('/api/pdf-to-text', { method: 'POST', body: formData });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setTimeout(() => {
          document.getElementById('loadingModal').style.display = 'none';
          showSuccessModal('Text file successfully generated and downloaded.');
        }, 6000); // 6 seconds, adjust as needed
      } else {
        document.getElementById('loadingModal').style.display = 'none';
        alert('Conversion failed.');
      }
    });
  }

  // PDF to Image Form
  const pdfToImageForm = document.getElementById('pdfToImageForm');
  const pdfToImageModal = document.getElementById('pdfToImageModal');
  if (pdfToImageForm && pdfToImageModal) {
    pdfToImageForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      pdfToImageModal.style.display = 'none'; // Hide modal immediately

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
  const imageToPDFModal = document.getElementById('imageToPDFModal');
  if (imageToPDFForm && imageToPDFModal) {
    imageToPDFForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      imageToPDFModal.style.display = 'none'; // Hide modal immediately

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

  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = feedbackForm.querySelector('[name="name"]').value;
      const email = feedbackForm.querySelector('[name="email"]').value;
      const message = feedbackForm.querySelector('[name="message"]').value;

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();
      if (result.success) {
        alert('Thank you for your feedback!');
        feedbackForm.reset();
      } else {
        alert('Failed to send feedback. Please try again later.');
      }
    });
  }

  function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const msg = modal.querySelector('p');
    msg.innerHTML = `<strong>Success!</strong> ${message}`;
    modal.style.display = 'block';
}

document.getElementById('closeSuccessModal').onclick = function() {
    document.getElementById('successModal').style.display = 'none';
};
});