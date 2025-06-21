import sys
from pdfminer.high_level import extract_text

if len(sys.argv) != 3:
    print("Usage: pdf2txt.py input.pdf output.txt")
    sys.exit(1)

pdf_path = sys.argv[1]
txt_path = sys.argv[2]

print("Converting:", pdf_path, "to", txt_path)

try:
    text = extract_text(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Conversion successful! Output saved to:", txt_path)
except Exception as e:
    print("Error during conversion:", e)
    sys.exit(2)