# PDF Generation Script

This script generates a PDF file from all markdown files in the `updates` directory, formatted similar to Docusaurus pages.

## Installation

Install the required Python dependencies:

```bash
pip install -r requirements_pdf.txt
```

Or install manually:

```bash
pip install markdown reportlab
```

**Note:** This script uses ReportLab which is a pure Python library and doesn't require any system dependencies. It should work out of the box on macOS, Linux, and Windows.

## Usage

Run the script from the `DocumentProject` directory:

```bash
python3 generate_updates_pdf.py
```

Or make it executable and run directly:

```bash
chmod +x generate_updates_pdf.py
./generate_updates_pdf.py
```

### Command-Line Options

The script supports several command-line flags:

#### Basic Usage
```bash
# Generate PDF with all updates (newest first - default)
python3 generate_updates_pdf.py

# Generate PDF with updates sorted oldest first
python3 generate_updates_pdf.py --orderby ASC

# Generate PDF with updates sorted newest first
python3 generate_updates_pdf.py --orderby DESC

# Specify custom output filename
python3 generate_updates_pdf.py --orderby ASC --output custom_updates.pdf

# Specify custom updates directory
python3 generate_updates_pdf.py --updates-dir /path/to/updates
```

#### Available Flags

- `--orderby ASC|DESC`: Sort order for updates (default: `DESC`)
  - `ASC`: Oldest updates first
  - `DESC`: Newest updates first
- `--output FILENAME`: Specify output PDF filename (default: `updates.pdf`)
- `--updates-dir PATH`: Specify path to updates directory (default: `./updates`)
- `--help`: Show help message with all options

The script will:
1. Read all markdown files from the `updates` directory
2. Filter by date range if specified
3. Sort them by date (newest first)
4. Convert them to PDF with Docusaurus-like styling
5. Generate a PDF file in the `DocumentProject` directory

## Output

The generated PDF will include:
- A header with title and generation date
- All updates sorted by date (newest first)
- Each update with its date as a header
- Properly formatted markdown content (headings, lists, code blocks, etc.)
- Docusaurus-like styling and formatting

## Features

- Automatically extracts dates from filenames
- Formats dates in a readable format
- Supports all standard markdown features (headings, lists, code blocks, tables, etc.)
- Docusaurus-inspired styling
- Page breaks between updates
- Professional PDF layout
