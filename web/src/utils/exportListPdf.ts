import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExportRow } from '../types/index.js';
import i18n from '../i18n/index.js';
import { formatShortDate, slugify } from './stringUtils.js';

interface ExportListData {
  list: { title: string };
  items: ExportRow[];
}

export function downloadListPdf(data: ExportListData): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const locale = i18n.language.startsWith('he') ? 'he-IL' : 'en-US';
  const exportedAt = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const claimedCount = data.items.filter((item) => item.status === 'Claimed').length;

  doc.setFontSize(18);
  doc.text(data.list.title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(i18n.t('export.exported', { date: exportedAt }), 14, 26);
  doc.text(i18n.t('export.summary', { total: data.items.length, claimed: claimedCount }), 14, 32);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 38,
    head: [[
      i18n.t('export.columns.number'),
      i18n.t('export.columns.item'),
      i18n.t('export.columns.price'),
      i18n.t('export.columns.status'),
      i18n.t('export.columns.guest'),
      i18n.t('export.columns.claimed'),
    ]],
    body: data.items.map((item) => [
      String(item.item_number),
      item.title,
      item.price ?? i18n.t('common.dash'),
      item.status === 'Claimed' ? i18n.t('export.statusClaimed') : i18n.t('export.statusAvailable'),
      item.guest_name ?? i18n.t('common.dash'),
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

  const filename = slugify(data.list.title) || i18n.t('export.filename');
  doc.save(`${filename}-export.pdf`);
}
