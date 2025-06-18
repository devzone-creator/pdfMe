import sys
from pdf2image import convert_from_path

if len(sys.argv) != 3:
    print("Usage: pdf2img.py input_pdf output_image")
    sys.exit(1)

pdf_path = sys.argv[1]
img_path = sys.argv[2]

images = convert_from_path(pdf_path)
images[0].save(img_path, 'PNG')