import { jsPDF } from 'jspdf';
import { GeneratedGuide } from '../types';

export const downloadPDF = (guide: GeneratedGuide) => {
  const doc = new jsPDF();
  
  const lineHeight = 7;
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - (margin * 2);

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("User Guide", margin, y);
  y += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Source: ${guide.url}`, margin, y);
  y += 20;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");

  const lines = guide.content.split('\n');
  
  lines.forEach((line) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Check for Markdown Image syntax: ![Alt](id)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);

    if (imgMatch) {
      const altText = imgMatch[1];
      const imgId = imgMatch[2];
      const screenshot = guide.screenshots.find(s => s.id === imgId);

      if (screenshot) {
        // Render Image
        const imgHeight = 60; // Fixed height for PDF for simplicity
        const imgWidth = 100; 
        const x = margin + (maxLineWidth - imgWidth) / 2; // Center image
        
        if (y + imgHeight + 10 > 280) {
          doc.addPage();
          y = 20;
        }

        try {
          doc.addImage(screenshot.data, 'JPEG', x, y, imgWidth, imgHeight);
          y += imgHeight + 5;
          
          // Caption
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.setFont("helvetica", "italic");
          const caption = `Figure: ${altText}`;
          const captionWidth = doc.getTextWidth(caption);
          doc.text(caption, (pageWidth - captionWidth) / 2, y);
          y += 10;
          
          doc.setFontSize(11);
          doc.setTextColor(0);
          doc.setFont("helvetica", "normal");
        } catch (e) {
          console.error("Failed to add image to PDF", e);
        }
      } else {
        // Fallback if image ID not found but syntax matches
         doc.setFont("courier", "normal");
         doc.setFontSize(9);
         doc.text(`[Image missing: ${altText}]`, margin, y);
         y += 10;
         doc.setFont("helvetica", "normal");
         doc.setFontSize(11);
      }
    }
    // Heading 1
    else if (line.startsWith('# ')) {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const text = line.replace('# ', '');
      doc.text(text, margin, y);
      y += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
    }
    // Heading 2
    else if (line.startsWith('## ')) {
      y += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const text = line.replace('## ', '');
      doc.text(text, margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
    }
    // Bullet points
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      const text = '• ' + line.substring(2);
      const splitText = doc.splitTextToSize(text, maxLineWidth);
      doc.text(splitText, margin + 5, y);
      y += (splitText.length * lineHeight);
    }
    // Screenshot placeholder (legacy support)
    else if (line.includes('[SCREENSHOT')) {
      y += 5;
      doc.setFillColor(240, 240, 240);
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, maxLineWidth, 40, 'FD');
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      
      const text = line.replace(/\[|\]/g, '').replace('SCREENSHOT:', '').trim();
      const splitText = doc.splitTextToSize(text, maxLineWidth - 10);
      doc.text(splitText, margin + 5, y + 20);
      
      y += 50;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0);
    }
    // Normal text
    else if (line.trim().length > 0) {
      const splitText = doc.splitTextToSize(line, maxLineWidth);
      doc.text(splitText, margin, y);
      y += (splitText.length * lineHeight);
    }
    // Empty lines
    else {
      y += lineHeight / 2;
    }
  });

  doc.save(`User_Guide_${Date.now()}.pdf`);
};