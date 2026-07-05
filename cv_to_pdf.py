from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import mm
from reportlab.lib import colors

md = open(r'C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\YOSEP_DANNY_CHRISTIAN_CV.md', encoding='utf-8').read()
doc = SimpleDocTemplate(r'C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\YOSEP_DANNY_CHRISTIAN_CV.pdf', pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCV', fontSize=14, fontName='Helvetica-Bold', spaceAfter=4))
styles.add(ParagraphStyle(name='Contact', fontSize=8, textColor=colors.gray, spaceAfter=6))
styles.add(ParagraphStyle(name='H2CV', fontSize=11, fontName='Helvetica-Bold', spaceBefore=8, spaceAfter=3))
styles.add(ParagraphStyle(name='H3CV', fontSize=10, fontName='Helvetica-Bold', spaceBefore=5, spaceAfter=2))
styles.add(ParagraphStyle(name='BodyCV', fontSize=9, leading=11))
styles.add(ParagraphStyle(name='BulletCV', fontSize=9, leading=10, leftIndent=8, bulletIndent=3))
styles.add(ParagraphStyle(name='Small', fontSize=8, textColor=colors.gray))

story = []
lines = md.split('\n')
for line in lines:
    line = line.strip()
    if line.startswith('# '):
        story.append(Paragraph(line[2:], styles['TitleCV']))
    elif 'Bandung, Indonesia' in line and 'flinct' in line:
        story.append(Paragraph(line, styles['Contact']))
    elif line.startswith('## '):
        story.append(Spacer(1, 3*mm))
        story.append(Paragraph(line[3:], styles['H2CV']))
    elif line.startswith('### '):
        story.append(Paragraph(line[4:], styles['H3CV']))
    elif line.startswith('- ') or line.startswith('* '):
        story.append(Paragraph('• ' + line[2:], styles['BulletCV']))
    elif line == '---':
        story.append(Spacer(1, 2*mm))
    elif line.startswith('|') and 'Category' not in line and '---' not in line:
        parts = [p.strip() for p in line.split('|') if p.strip()]
        if len(parts) == 2:
            bold_text = '<b>' + parts[0] + '</b>: ' + parts[1]
            story.append(Paragraph(bold_text, styles['BodyCV']))
    elif line == '':
        pass
    else:
        story.append(Paragraph(line, styles['BodyCV']))

doc.build(story)
print('PDF created')
