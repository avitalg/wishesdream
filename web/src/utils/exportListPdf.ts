import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportRow } from '../types/index.js';
import { formatShortDate, slugify } from './stringUtils.js';

interface ExportListData {
  list: { title: string };
  items: ExportRow[];
}

export function downloadListPdf(data: ExportListData): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const exportedAt = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const claimedCount = data.items.filter((item) => item.status === 'Claimed').length;

  doc.setFontSize(18);
  doc.text(data.list.title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exported ${exportedAt}`, 14, 26);
  doc.text(`${data.items.length} items · ${claimedCount} claimed`, 14, 32);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Item', 'Price', 'Status', 'Guest', 'Claimed']],
    body: data.items.map((item) => [
      String(item.item_number),
      item.title,
      item.price ?? '—',
      item.status,
      item.guest_name ?? '—',
      formatShortDate(item.claimed_at),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [58, 54, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 40 },
      5: { cellWidth: 28 },
    },
    alternateRowStyles: {
      fillColor: [247, 245, 242],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${slugify(data.list.title) || 'gift-list'}-export.pdf`);
}
