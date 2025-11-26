// Utility to parse WhatsApp order text into order fields
// Example expected format:
// Customer: John Doe
// Phone: 1234567890
// Address: 123 Main St
// Items:
// Item1 x2 @100
// Item2 x1 @50
// Taxes: 18
// Discount: 10
// Notes: Urgent

import { OrderItem } from '../store/realmSchemas';

export function parseWhatsappOrder(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let customerName = '';
  let phone = '';
  let address = '';
  let notes = '';
  let taxes = 0;
  let discount = 0;
  let items: OrderItem[] = [];
  let inItems = false;
  let itemId = 1;

  for (let line of lines) {
    if (/^customer[:\-]/i.test(line)) {
      customerName = line.split(/[:\-]/)[1]?.trim() || '';
    } else if (/^phone[:\-]/i.test(line)) {
      phone = line.split(/[:\-]/)[1]?.trim() || '';
    } else if (/^address[:\-]/i.test(line)) {
      address = line.split(/[:\-]/)[1]?.trim() || '';
    } else if (/^items[:\-]?/i.test(line)) {
      inItems = true;
    } else if (/^tax(es)?[:\-]/i.test(line)) {
      taxes = parseFloat(line.split(/[:\-]/)[1]?.trim() || '0');
      inItems = false;
    } else if (/^discount[:\-]/i.test(line)) {
      discount = parseFloat(line.split(/[:\-]/)[1]?.trim() || '0');
      inItems = false;
    } else if (/^notes?[:\-]/i.test(line)) {
      notes = line.split(/[:\-]/)[1]?.trim() || '';
      inItems = false;
    } else if (inItems && line) {
      // Item line: Name xQty @Rate
      const m = line.match(/^(.*?)\s*x(\d+)\s*@([\d.]+)/i);
      if (m) {
        const name = m[1].trim();
        const quantity = parseInt(m[2], 10);
        const rate = parseFloat(m[3]);
        items.push({ id: String(itemId++), name, quantity, rate, total: quantity * rate });
      }
    }
  }
  return { customerName, phone, address, notes, taxes, discount, items };
}
