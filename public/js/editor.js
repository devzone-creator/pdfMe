document.addEventListener('DOMContentLoaded', () => {
  const canvas = new fabric.Canvas('canvas', { selection: true, backgroundColor: '#fff' });
  window.canvas = canvas;

  const status = document.getElementById('status');
  function setStatus(s) { status.textContent = s; }

  document.getElementById('addText').addEventListener('click', () => {
    const it = new fabric.IText('New text', { left: 50, top: 50, fontSize: 18, fill: '#111' });
    canvas.add(it);
    canvas.setActiveObject(it);
  });

  // Import DOCX
  const docxInput = document.getElementById('docxInput');
  docxInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Uploading DOCX and converting...');
    const fd = new FormData();
    fd.append('docx', file);
    try {
      const res = await fetch('/editor/import-docx', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Import failed');
      const data = await res.json();
      // Convert returned HTML to plain text for now
      const tmp = document.createElement('div');
      tmp.innerHTML = data.html || '';
      const text = tmp.textContent || tmp.innerText || '';
      const tb = new fabric.Textbox(text, { left: 20, top: 20, width: 555, fontSize: 14, fill: '#111' });
      canvas.clear();
      canvas.add(tb);
      setStatus('Imported DOCX — adjust on canvas.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to import DOCX.');
    }
  });

  // Upload image
  const imageInput = document.getElementById('imageInput');
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(300);
        canvas.add(img);
        setStatus('Image added.');
      });
    };
    reader.readAsDataURL(file);
  });

  // Export to PDF using html2canvas + jsPDF
  document.getElementById('exportPDF').addEventListener('click', async () => {
    setStatus('Rendering PDF...');
    const container = document.getElementById('canvasContainer');
    try {
      const canvasEl = document.getElementById('canvas');
      // Use toDataURL of fabric canvas for better quality
      const dataUrl = canvasEl.toDataURL({ format: 'png', multiplier: 2 });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('design.pdf');
      setStatus('PDF generated.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to generate PDF.');
    }
  });

});
