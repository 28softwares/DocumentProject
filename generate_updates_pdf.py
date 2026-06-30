#!/usr/bin/env python3
"""
Script to generate a PDF from Docusaurus updates directory.
Reads all markdown files from the updates directory and creates a formatted PDF.
"""

import re
import argparse
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.enums import TA_CENTER

def extract_date_from_filename(filename):
    """Extract date from filename like '2025-12-30-December 30.md'"""
    match = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
    if match:
        return match.group(1)
    return None

def format_date(date_str):
    """Format date string to readable format"""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')
    except:
        return date_str

def read_markdown_files(updates_dir):
    """Read all markdown files from updates directory and return sorted list"""
    updates_path = Path(updates_dir)
    markdown_files = []
    
    for file_path in updates_path.glob('*.md'):
        if file_path.name in ['authors.yml', 'tags.yml']:
            continue
        
        date_str = extract_date_from_filename(file_path.name)
        if date_str:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            markdown_files.append({
                'filename': file_path.name,
                'date': date_str,
                'formatted_date': format_date(date_str),
                'content': content
            })
    
    return markdown_files

def parse_markdown_to_paragraphs(markdown_content, styles):
    """Parse markdown content and convert to ReportLab flowables"""
    flowables = []
    
    # Split by lines and process
    lines = markdown_content.split('\n')
    in_code_block = False
    code_block_lines = []
    
    for line in lines:
        original_line = line
        line = line.rstrip()
        
        # Handle fenced code blocks (```)
        if line.startswith('```'):
            if in_code_block:
                # End of code block
                if code_block_lines:
                    code_text = '\n'.join(code_block_lines)
                    flowables.append(Preformatted(code_text, styles['Code'], maxLineLength=80))
                    flowables.append(Spacer(1, 0.3*cm))
                code_block_lines = []
                in_code_block = False
            else:
                in_code_block = True
            continue
        
        if in_code_block:
            code_block_lines.append(line)
            continue
        
        # Skip empty lines
        if not line.strip():
            flowables.append(Spacer(1, 0.2*cm))
            continue
        
        # Handle headings with #
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            text = line.lstrip('#').strip()
            
            if level == 1:
                flowables.append(Paragraph(text, styles['Heading1']))
            elif level == 2:
                flowables.append(Paragraph(text, styles['Heading2']))
            elif level == 3:
                flowables.append(Paragraph(text, styles['Heading3']))
            else:
                flowables.append(Paragraph(text, styles['Heading3']))
            flowables.append(Spacer(1, 0.4*cm))
            continue
        
        # Handle section headers in backticks (like `Backend Changes`)
        if line.strip().startswith('`') and line.strip().endswith('`') and line.count('`') == 2:
            text = line.strip().strip('`')
            # Treat as heading
            flowables.append(Paragraph(text, styles['Heading1']))
            flowables.append(Spacer(1, 0.3*cm))
            continue
        
        # Handle lists
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            text = line.strip()[2:].strip()
            # Check if it contains inline code
            if '`' in text:
                # Process inline code in list items
                parts = re.split(r'(`[^`]+`)', text)
                para_text = ''
                for part in parts:
                    if part.startswith('`') and part.endswith('`'):
                        # Inline code
                        code_text = part.strip('`')
                        para_text += f'<font face="Courier" color="#e11d48" size="11">{code_text}</font>'
                    else:
                        # Regular text - escape HTML
                        escaped = part.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        para_text += escaped
                flowables.append(Paragraph(f'• {para_text}', styles['CustomBullet']))
            else:
                # Regular list item
                text_escaped = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                flowables.append(Paragraph(f'• {text_escaped}', styles['CustomBullet']))
            continue
        
        if re.match(r'^\d+\.\s', line.strip()):
            text = re.sub(r'^\d+\.\s', '', line.strip())
            text_escaped = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            flowables.append(Paragraph(f'• {text_escaped}', styles['Bullet']))
            continue
        
        # Handle inline code in regular paragraphs
        if '`' in line:
            # Process inline code
            parts = re.split(r'(`[^`]+`)', line)
            para_text = ''
            for part in parts:
                if part.startswith('`') and part.endswith('`'):
                    # Inline code
                    code_text = part.strip('`')
                    para_text += f'<font face="Courier" color="#e11d48" size="11">{code_text}</font>'
                else:
                    # Regular text - escape HTML
                    escaped = part.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    para_text += escaped
            if para_text.strip():
                flowables.append(Paragraph(para_text, styles['BodyText']))
                flowables.append(Spacer(1, 0.2*cm))
            continue
        
        # Regular paragraph
        # Escape HTML entities and special characters for ReportLab
        text = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        flowables.append(Paragraph(text, styles['BodyText']))
        flowables.append(Spacer(1, 0.2*cm))
    
    return flowables

def generate_pdf(updates_dir, output_path, orderby='DESC'):
    """Main function to generate PDF from updates directory
    
    Args:
        updates_dir: Path to updates directory
        output_path: Path to output PDF file
        orderby: Sort order - 'ASC' for oldest first, 'DESC' for newest first (default: 'DESC')
    """
    print(f"Reading markdown files from: {updates_dir}")
    updates_data = read_markdown_files(updates_dir)
    
    if not updates_data:
        print("No markdown files found in updates directory!")
        return
    
    # Sort by date based on orderby parameter
    orderby_upper = orderby.upper()
    if orderby_upper == 'ASC':
        updates_data.sort(key=lambda x: x['date'], reverse=False)
        print("Sorting: Oldest first (ASC)")
    elif orderby_upper == 'DESC':
        updates_data.sort(key=lambda x: x['date'], reverse=True)
        print("Sorting: Newest first (DESC)")
    else:
        print(f"Warning: Invalid orderby value '{orderby}'. Using default DESC.")
        updates_data.sort(key=lambda x: x['date'], reverse=True)
    
    print(f"Found {len(updates_data)} update files")
    print("Generating PDF...")
    
    # Create PDF document
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Get styles and customize them
    styles = getSampleStyleSheet()
    
    # Modify existing styles and add custom ones
    # Custom Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=32,
        textColor=HexColor('#1e293b'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Custom Subtitle style
    styles.add(ParagraphStyle(
        name='CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#64748b'),
        spaceAfter=20,
        alignment=TA_CENTER
    ))
    
    # Custom UpdateDate style
    styles.add(ParagraphStyle(
        name='UpdateDate',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=HexColor('#1e293b'),
        spaceAfter=12,
        fontName='Helvetica-Bold',
        backColor=HexColor('#f8fafc'),
        leftIndent=20,
        rightIndent=20,
        borderPadding=10
    ))
    
    # Modify existing Heading1
    styles['Heading1'].fontSize = 20
    styles['Heading1'].textColor = HexColor('#1e293b')
    styles['Heading1'].spaceAfter = 12
    styles['Heading1'].spaceBefore = 20
    styles['Heading1'].fontName = 'Helvetica-Bold'
    
    # Modify existing Heading2
    styles['Heading2'].fontSize = 16
    styles['Heading2'].textColor = HexColor('#334155')
    styles['Heading2'].spaceAfter = 10
    styles['Heading2'].spaceBefore = 15
    styles['Heading2'].fontName = 'Helvetica-Bold'
    
    # Modify existing Heading3
    styles['Heading3'].fontSize = 14
    styles['Heading3'].textColor = HexColor('#334155')
    styles['Heading3'].spaceAfter = 8
    styles['Heading3'].spaceBefore = 12
    styles['Heading3'].fontName = 'Helvetica-Bold'
    
    # Modify existing BodyText
    styles['BodyText'].fontSize = 12
    styles['BodyText'].textColor = HexColor('#213547')
    styles['BodyText'].spaceAfter = 6
    styles['BodyText'].leading = 18
    
    # Custom Bullet style
    styles.add(ParagraphStyle(
        name='CustomBullet',
        parent=styles['BodyText'],
        fontSize=12,
        textColor=HexColor('#213547'),
        leftIndent=20,
        spaceAfter=4,
        bulletIndent=10
    ))
    
    # Modify existing Code style
    styles['Code'].fontSize = 10
    styles['Code'].fontName = 'Courier'
    styles['Code'].textColor = HexColor('#e2e8f0')
    styles['Code'].backColor = HexColor('#1e293b')
    styles['Code'].leftIndent = 20
    styles['Code'].rightIndent = 20
    styles['Code'].borderPadding = 10
    
    # Custom Footer style
    styles.add(ParagraphStyle(
        name='CustomFooter',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#64748b'),
        alignment=TA_CENTER,
        spaceBefore=20
    ))
    
    # Build PDF content
    story = []
    
    # Header
    story.append(Paragraph("MeroUni Updates", styles['CustomTitle']))
    story.append(Paragraph("Documentation of all updates and changes", styles['CustomSubtitle']))
    story.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        styles['CustomSubtitle']
    ))
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=2, color=HexColor('#e5e7eb')))
    story.append(Spacer(1, 1*cm))
    
    # Add each update
    for idx, update in enumerate(updates_data):
        # Update date header
        story.append(Paragraph(update['formatted_date'], styles['UpdateDate']))
        story.append(Spacer(1, 0.5*cm))
        
        # Parse and add content
        content_flowables = parse_markdown_to_paragraphs(update['content'], styles)
        story.extend(content_flowables)
        
        # Add page break between updates (except the last one)
        if idx < len(updates_data) - 1:
            story.append(PageBreak())
    
    # Footer
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#e5e7eb')))
    story.append(Spacer(1, 0.5*cm))
    # story.append(Paragraph(
    #     "MeroUni Updates Documentation | Generated automatically from markdown files",
    #     styles['CustomFooter']
    # ))
    
    # Build PDF
    try:
        doc.build(story)
        print(f"✓ PDF generated successfully: {output_path}")
        print(f"  Total updates: {len(updates_data)}")
        print(f"  Date range: {updates_data[-1]['formatted_date']} to {updates_data[0]['formatted_date']}")
    except Exception as e:
        print(f"✗ Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
        print("\nMake sure you have installed the required dependencies:")
        print("  pip install reportlab")
        print("  Or: pip install -r requirements_pdf.txt")

if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description='Generate PDF from Docusaurus updates directory',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate PDF with all updates (newest first - default)
  python3 generate_updates_pdf.py
  
  # Generate PDF with updates sorted oldest first
  python3 generate_updates_pdf.py --orderby ASC
  
  # Generate PDF with updates sorted newest first
  python3 generate_updates_pdf.py --orderby DESC
  
  # Specify custom output file
  python3 generate_updates_pdf.py --orderby ASC --output custom_updates.pdf
        """
    )
    
    parser.add_argument(
        '--orderby',
        type=str,
        choices=['ASC', 'DESC', 'asc', 'desc'],
        default='DESC',
        help='Sort order: ASC for oldest first, DESC for newest first (default: DESC)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='updates.pdf',
        help='Output PDF filename (default: updates.pdf)'
    )
    
    parser.add_argument(
        '--updates-dir',
        type=str,
        help='Path to updates directory (default: ./updates relative to script)'
    )
    
    args = parser.parse_args()
    
    # Get the script directory
    script_dir = Path(__file__).parent
    
    # Set paths
    if args.updates_dir:
        updates_dir = Path(args.updates_dir)
    else:
        updates_dir = script_dir / 'updates'
    
    if args.output:
        if Path(args.output).is_absolute():
            output_path = Path(args.output)
        else:
            output_path = script_dir / args.output
    else:
        output_path = script_dir / 'updates.pdf'
    
    # Check if updates directory exists
    if not updates_dir.exists():
        print(f"Error: Updates directory not found at {updates_dir}")
        exit(1)
    
    # Generate PDF
    generate_pdf(updates_dir, output_path, args.orderby)
