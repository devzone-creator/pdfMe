import sys
from pdf2docx import Converter

if len(sys.argv) != 3:
    print("Usage: pdf2docx_convert.py input.pdf output.docx")
    sys.exit(1)

pdf_path = sys.argv[1]
docx_path = sys.argv[2]

print("Converting:", pdf_path, "to", docx_path)

try:
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()
    print("Conversion successful! Output saved to:", docx_path)
except Exception as e:
    print("Error during conversion:", e)
    sys.exit(2)