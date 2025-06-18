import sys
from PIL import Image

if len(sys.argv) != 3:
    print("Usage: image2pdf.py input_image output_pdf")
    sys.exit(1)

img_path = sys.argv[1]
pdf_path = sys.argv[2]

image = Image.open(img_path)
if image.mode == "RGBA":
    image = image.convert("RGB")
image.save(pdf_path, "PDF", resolution=100.0)