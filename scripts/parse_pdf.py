"""
parse_pdf.py

A command-line tool to extract all text from a PDF file and save it as a markdown (.md) file in the same directory as the original PDF.

Usage:
    python scripts/parse_pdf.py /path/to/file.pdf

Dependencies:
    - PyPDF2

The output markdown file will have the same name as the PDF, but with a .md extension.
"""
import sys
import os
from PyPDF2 import PdfReader


def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
        text += "\n"
    return text


def save_text_as_markdown(text, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/parse_pdf.py /path/to/file.pdf")
        sys.exit(1)
    pdf_path = sys.argv[1]
    if not os.path.isfile(pdf_path) or not pdf_path.lower().endswith('.pdf'):
        print(f"Error: {pdf_path} is not a valid PDF file.")
        sys.exit(1)
    text = extract_text_from_pdf(pdf_path)
    output_path = os.path.splitext(pdf_path)[0] + '.md'
    save_text_as_markdown(text, output_path)
    print(f"Extracted text saved to {output_path}")


if __name__ == "__main__":
    main()
