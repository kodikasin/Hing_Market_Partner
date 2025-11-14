import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import React, { useRef, useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch } from 'react-redux';
import { Order, removeOrder } from '../../store/orderSlice';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { generatePDF } from 'react-native-html-to-pdf';

interface IMenu {
  order: Order;
  navigation: any;
}

const Menu = ({ order, navigation }: IMenu) => {
  const dispatch = useDispatch();
  const viewHeight = useRef(new Animated.Value(0)).current;

  const heightExpand = () => {
    Animated.timing(viewHeight, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const heightStyle = viewHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuHandler = () => {
    if (isMenuOpen) {
      viewHeight.setValue(0);
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      requestAnimationFrame(() => {
        heightExpand();
      });
    }
  };

  // helper: escape HTML for template replacements
  function escapeHtml(str: any) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCurrency(n: number) {
    if (typeof n !== 'number') n = Number(n) || 0;
    return `₹${n.toFixed(2)}`;
  }

  function numberToWords(num: number) {
    // Simple Indian number to words (handles up to crores reasonably)
    if (!Number.isFinite(num)) return '';
    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function twoDigit(n: number) {
      if (n < 20) return a[n];
      const tens = Math.floor(n / 10);
      const rest = n % 10;
      return b[tens] + (rest ? ' ' + a[rest] : '');
    }

    function threeDigit(n: number) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      return (hundred ? a[hundred] + ' Hundred' + (rest ? ' ' : '') : '') + (rest ? twoDigit(rest) : '');
    }

    if (num === 0) return 'Zero';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = num % 1000;
    let words = '';
    if (crore) words += threeDigit(crore) + ' Crore ';
    if (lakh) words += threeDigit(lakh) + ' Lakh ';
    if (thousand) words += threeDigit(thousand) + ' Thousand ';
    if (hundred) words += threeDigit(hundred);
    return words.trim();
  }

  function buildItemsHtml(items: any[]) {
    return (items || [])
      .map((it, idx) => {
        const line = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
        const taxPercent = it.taxPercent || 0;
        const taxAmount = (line * taxPercent) / 100;
        const total = line + taxAmount;
        return `<tr><td>${idx + 1}</td><td>${escapeHtml(it.name)}</td><td>${escapeHtml(it.hsn || it.hsnCode || '')}</td><td class="center">${it.quantity}</td><td class="center">${escapeHtml(it.unit || '')}</td><td class="right">${formatCurrency(Number(it.rate) || 0)}</td><td class="right">${formatCurrency(taxAmount)}</td><td class="right">${formatCurrency(total)}</td></tr>`;
      })
      .join('');
  }

  // Mobile-specific items renderer: compact two-column rows (desc | amount)
  function buildItemsHtmlMobile(items: any[]) {
    return (items || [])
      .map((it, _idx) => {
        const qtyNum = Number(it.quantity) || 0;
        const rateNum = Number(it.rate) || 0;
        const line = qtyNum * rateNum;
        const taxPercent = Number(it.taxPercent) || 0;
        const taxAmount = (line * taxPercent) / 100;
        const total = line + taxAmount;
        const desc = escapeHtml(it.name || '');
  const hsn = escapeHtml(it.hsn || it.hsnCode || '');
        const qty = escapeHtml(String(qtyNum || ''));
        const rate = formatCurrencyMobile(rateNum || 0);
        return `<tr class="item-row"><td class="desc">${desc}${hsn ? '<div style="font-size:11px;color:#666">HSN: ' + hsn + '</div>' : ''}</td><td class="rate">${rate}</td><td class="qty">${qty}</td><td class="amount">${formatCurrencyMobile(total)}</td></tr>`;
      })
      .join('');
  }

  // Mobile formatter (no decimals, whole-rupee style like retail receipts)
  function formatCurrencyMobile(n: number) {
    if (typeof n !== 'number') n = Number(n) || 0;
    return `₹${Math.round(n)}`;
  }

  // Inline desktop fallback template (used if asset isn't present)
  const inlineTemplateDesktop = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Delivery Challan</title>
  <style>
    body{font-family: 'Helvetica Neue', Arial, sans-serif; color:#222; margin:0; padding:18px; background:#fff}
    .sheet{max-width:1000px;margin:0 auto;border:1px solid #344055;padding:10px}
    .title{text-align:center;font-size:28px;font-weight:700;color:#2b2b39;margin-bottom:6px}
    .companyBox{border:1px solid #344055;padding:10px}
    .companyName{font-size:16px;font-weight:800}
    .small{font-size:12px;color:#333}
    .twoCol{display:flex;gap:12px}
    .row{display:flex}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #cfcfd6;padding:8px}
    th{background:#f2f4f9;font-weight:700}
    .right{text-align:right}
    .center{text-align:center}
    .no-border{border:none}
    .summaryTable td{border:1px solid #cfcfd6}
    .taxSummary th, .taxSummary td{font-size:12px}
    .section{margin-top:8px}
    .terms{font-size:12px;border:1px solid #cfcfd6;padding:8px}
    .signTable td{height:90px;vertical-align:top}
    .muted{color:#555;font-size:12px}
  </style>
</head>
<body>
  <div class="sheet">
    <div class="title">Delivery Challan</div>

    <div class="companyBox">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="companyName">{{companyName}}</div>
          <div class="small">{{companyAddress}}</div>
          <div class="small">Phone: {{companyPhone}}</div>
          <div class="small">State: {{companyState}}</div>
        </div>
        <div style="text-align:right">
          <div class="small"><strong>GSTIN:</strong> {{companyGSTIN}}</div>
        </div>
      </div>

      <div style="display:flex;margin-top:8px">
        <div style="flex:1;border:1px solid #cfcfd6;padding:6px">
          <div style="font-weight:700">Delivery Challan for</div>
          <div style="margin-top:6px">{{customerName}}<br/>{{customerAddressLine}}</div>
        </div>
        <div style="width:320px;border:1px solid #cfcfd6;padding:6px;margin-left:8px">
          <div style="font-weight:700">Challan Details:</div>
          <div style="margin-top:6px">No: {{challanNo}}<br/>Date: {{challanDate}}<br/>Place of Supply: {{placeOfSupply}}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th style="width:4%">#</th>
            <th style="width:30%">Item Name</th>
            <th style="width:10%">HSN / SAC</th>
            <th style="width:8%" class="center">Quantity</th>
            <th style="width:8%" class="center">Unit</th>
            <th style="width:12%" class="right">Price/ Unit (₹)</th>
            <th style="width:10%" class="right">GST(₹)</th>
            <th style="width:12%" class="right">Amount(₹)</th>
          </tr>
        </thead>
        <tbody>
          {{items}}
          <tr>
            <td colspan="3" class="right" style="font-weight:700">Total</td>
            <td class="center">{{totalQuantity}}</td>
            <td class="no-border"></td>
            <td class="no-border"></td>
            <td class="right" style="font-weight:700">{{taxTotal}}</td>
            <td class="right" style="font-weight:700">{{totalAmount}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section" style="display:flex;gap:12px;margin-top:8px">
      <div style="flex:1">
        <div style="font-weight:700">Tax Summary:</div>
        <table class="taxSummary" style="margin-top:6px">
          <thead>
            <tr><th style="width:20%">HSN/ SAC</th><th style="width:30%">Taxable Amount (₹)</th><th style="width:12%">IGST Rate (%)</th><th style="width:12%">Amt (₹)</th><th style="width:16%">Total Tax(₹)</th></tr>
          </thead>
          <tbody>
            {{taxSummaryRows}}
            <tr>
              <td style="font-weight:700">TOTAL</td>
              <td style="font-weight:700">{{taxableTotal}}</td>
              <td></td>
              <td style="font-weight:700">{{taxTotal}}</td>
              <td style="font-weight:700">{{taxTotal}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="width:320px">
        <table class="summaryTable">
          <tbody>
            <tr><td>Sub Total</td><td class="right">{{subTotal}}</td></tr>
            <tr><td>Total</td><td class="right">{{totalAmount}}</td></tr>
            <tr><td>Delivery Challan Amount In Words :</td><td class="right" style="font-weight:700">{{amountInWords}}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section terms">
      <div style="font-weight:700">Terms And Conditions:</div>
      <div class="muted" style="margin-top:6px">{{terms}}</div>
    </div>

    <div class="section" style="margin-top:8px">
      <table style="width:100%;border-collapse:collapse" class="signTable">
        <thead>
          <tr><th>Received By:</th><th>Delivered By:</th><th>For {{companyShort}}:</th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align:top;padding:8px">Name:<br/>Comment:<br/>Date:<br/>Signature:</td>
            <td style="vertical-align:top;padding:8px">Name:<br/>Comment:<br/>Date:<br/>Signature:</td>
            <td style="vertical-align:top;padding:8px;text-align:center">&nbsp;<br/><img src="{{signatureImage}}" style="max-width:120px;max-height:60px" alt="signature"/><br/>Authorized Signatory</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  // Inline mobile fallback template
  const inlineTemplateMobile = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Receipt - Mobile</title>
  <style>
    :root{--max-w:320px;--muted:#666;--border:#cfcfcf}
    body{font-family: 'Courier New', Courier, monospace; margin:0; padding:6px; color:#111}
    .receipt{max-width:var(--max-w);margin:0 auto;padding:6px}
    .center{text-align:center}
    .logo{max-width:64px;margin:0 auto 4px}
    .brand{font-size:16px;font-weight:700}
    .small{font-size:11px;color:var(--muted);line-height:1.3}
    .title{font-size:13px;font-weight:700;margin-top:6px}
    .hline{border-bottom:1px dashed var(--border);margin:8px 0}
    table{width:100%;border-collapse:collapse;font-size:12px}
    thead th{font-weight:700;padding:6px 2px}
    tbody td{padding:10px 4px}
    .rate,.qty{width:56px;text-align:center}
    .amount{width:80px;text-align:right}
    .total-line{border-top:1px dashed var(--border);margin-top:6px;padding-top:6px}
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <img src="{{logo}}" class="logo" alt="logo"/>
      <div class="brand">{{companyName}}</div>
      <div class="small">{{companyAddress}}</div>
      <div class="small">Phone No: {{companyPhone}}</div>
      <div class="small">FSSAI No.: {{fssai}}</div>
      <div class="title">RETAIL INVOICE</div>
    </div>

    <div class="hline"></div>

    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
      <div>BILL NO: <strong>{{challanNo}}</strong></div>
      <div>BILL DATE: {{challanDate}}&nbsp;&nbsp;TIME: {{time}}</div>
    </div>

    <div class="hline"></div>

    <table>
      <thead>
        <tr>
          <th style="text-align:left">Particulars</th>
          <th class="rate">Rate</th>
          <th class="qty">Qty</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{items}}
      </tbody>
    </table>

    <div class="total-line"></div>
    <div style="text-align:center;margin-top:8px">Total</div>
    <div style="text-align:center;font-size:18px;font-weight:700">{{totalAmount}}</div>
    <div class="total-line"></div>

    <div style="margin-top:8px;font-size:11px;color:#666">Amount In Words: {{amountInWords}}</div>
    <div style="margin-top:4px;font-size:11px;color:#666">{{terms}}</div>

    <div style="text-align:center;margin-top:8px;font-size:11px;color:#666">GSTIN: {{companyGSTIN}} • Place of Supply: {{placeOfSupply}}</div>
  </div>
</body>
</html>`;

  async function loadTemplate(fileName = 'invoice_template.html'): Promise<string> {
    try {
      if (Platform.OS === 'android' && (RNFS as any).readFileAssets) {
        const content = await (RNFS as any).readFileAssets(fileName, 'utf8');
        console.debug('Loaded template from Android assets:', fileName);
        return content;
      }

      const bundlePath = `${RNFS.MainBundlePath}/${fileName}`;
      const content = await RNFS.readFile(bundlePath, 'utf8');
      console.debug('Loaded template from iOS bundle:', bundlePath);
      return content;
    } catch {
      console.debug('Using inline template fallback for', fileName);
      return fileName.includes('mobile') ? inlineTemplateMobile : inlineTemplateDesktop;
    }
  }

  async function onSharePDF() {
    // close menu immediately when an action is chosen
    setIsMenuOpen(false);
    



    

    try {
    const template = await loadTemplate();
    const itemsHtml = buildItemsHtml(order.items || []);

      const subtotal = (order.items || []).reduce(
        (s: number, it: any) =>
          s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
        0,
      );
      const totalTax = (order.items || []).reduce(
        (s: number, it: any) =>
          s +
          (Number(it.quantity) || 0) *
            (Number(it.rate) || 0) *
            ((Number(it.taxPercent) || 0) / 100),
        0,
      );
      const discount = Number(order.discount) || 0;
      const grandTotal = subtotal - discount + totalTax;

      // build tax summary grouped by HSN
      const taxGroups: Record<
        string,
        { taxable: number; rate: number; taxAmt: number }
      > = {};
      (order.items || []).forEach((it: any) => {
        const hsn = it.hsn || it.hsnCode || 'NA';
        const line = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
        const rate = Number(it.taxPercent) || 0;
        const taxAmt = (line * rate) / 100;
        if (!taxGroups[hsn]) taxGroups[hsn] = { taxable: 0, rate, taxAmt: 0 };
        taxGroups[hsn].taxable += line;
        taxGroups[hsn].taxAmt += taxAmt;
        // keep the rate as the last seen (assumes same rate per HSN)
        taxGroups[hsn].rate = rate;
      });

      const taxSummaryRows = Object.keys(taxGroups)
        .map(hsn => {
          const g = taxGroups[hsn];
          return `<tr><td>${escapeHtml(
            hsn,
          )}</td><td class="right">${formatCurrency(
            g.taxable,
          )}</td><td class="center">${
            g.rate
          }%</td><td class="right">${formatCurrency(
            g.taxAmt,
          )}</td><td class="right">${formatCurrency(g.taxAmt)}</td></tr>`;
        })
        .join('');

      const taxableTotal = Object.values(taxGroups).reduce(
        (s, g) => s + g.taxable,
        0,
      );
      const totalQuantity = (order.items || []).reduce(
        (s: number, it: any) => s + (Number(it.quantity) || 0),
        0,
      );

      const amountInWords =
        numberToWords(Math.floor(grandTotal)) + ' Rupees only';

      // safe access for optional order fields that aren't in the Order type
      const companyState = (order as any).state || '';
      const companyGstin = (order as any).gstin || '';
      const challanNoVal = (order as any).challanNo || order.id || '';
      const challanDateVal =
        (order as any).challanDate || new Date().toLocaleDateString();
      const placeOfSupplyVal =
        (order as any).placeOfSupply || companyState || '';
      const termsText =
        (order as any).terms || 'Thank you for doing business with us.';

      const html = template
        .replace(/{{customerName}}/g, escapeHtml(order.customerName || ''))
        .replace(/{{phone}}/g, escapeHtml(order.phone || ''))
        .replace(/{{address}}/g, escapeHtml(order.address || ''))
        .replace(/{{companyName}}/g, escapeHtml('Hing Market Partner'))
        .replace(
          /{{companyAddress}}/g,
          escapeHtml('123 Business St., City, State - 400001'),
        )
        .replace(/{{companyPhone}}/g, escapeHtml('+91 98765 43210'))
        .replace(/{{companyState}}/g, escapeHtml(companyState))
        .replace(/{{companyGSTIN}}/g, escapeHtml(companyGstin))
        .replace(/{{challanNo}}/g, escapeHtml(String(challanNoVal)))
        .replace(/{{challanDate}}/g, escapeHtml(challanDateVal))
        .replace(/{{placeOfSupply}}/g, escapeHtml(placeOfSupplyVal))
        .replace(/{{shipTo}}/g, escapeHtml(order.address || ''))
        .replace(/{{invoiceNumber}}/g, escapeHtml(`INV-${order.id}`))
        .replace(/{{date}}/g, escapeHtml(new Date().toLocaleDateString()))
        .replace(/{{items}}/g, itemsHtml)
        .replace(/{{subtotal}}/g, formatCurrency(subtotal))
        .replace(/{{subTotal}}/g, formatCurrency(subtotal))
        .replace(/{{discount}}/g, formatCurrency(discount))
        .replace(/{{tax}}/g, formatCurrency(totalTax))
        .replace(/{{taxTotal}}/g, formatCurrency(totalTax))
        .replace(/{{taxableTotal}}/g, formatCurrency(taxableTotal))
        .replace(/{{grandTotal}}/g, formatCurrency(grandTotal))
        .replace(/{{totalAmount}}/g, formatCurrency(grandTotal))
        .replace(/{{amountInWords}}/g, escapeHtml(amountInWords))
        .replace(/{{taxSummaryRows}}/g, taxSummaryRows)
        .replace(/{{totalQuantity}}/g, String(totalQuantity))
        .replace(/{{notes}}/g, escapeHtml(order.notes || ''))
        .replace(/{{terms}}/g, escapeHtml(termsText))
        .replace(/{{companyShort}}/g, escapeHtml('Hing Market Partner'))
        .replace(/{{taxableTotal}}/g, formatCurrency(taxableTotal))
        .replace(/{{signatureImage}}/g, '');

      const file = await generatePDF({
        html,
        fileName: `Invoice_${(order.customerName || 'customer').replace(
          /\s+/g,
          '_',
        )}_${order.id}`,
        base64: false,
      });
      const path = file.filePath; // e.g. /data/user/0/.../cache/Invoice_...pdf
      console.log('pdf path:', path);

      // sanity check: file exists
      const exists = await RNFS.exists(path);
      if (!exists) throw new Error('PDF file not found at: ' + path);

      // react-native-share works with file:// URIs on Android and direct path on iOS
      const url = Platform.OS === 'android' ? `file://${path}` : path;

      const shareOptions = {
        url,
        type: 'application/pdf',
        filename: `Invoice_${order.customerName}_${order.id}`,
        subject: `Invoice for ${order.customerName}`,
        message: `Invoice for ${order.customerName}`,
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.warn('PDF share error', err);
      // show user friendly message if needed
    }
  }

  // Mobile-specific share (component scope) - generates mobile-optimized PDF
  async function onSharePDFMobile() {
    setIsMenuOpen(false);
    try {
  const template = await loadTemplate('invoice_template_mobile.html');
  const itemsHtml = buildItemsHtmlMobile(order.items || []);

      const subtotal = (order.items || []).reduce(
        (s: number, it: any) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
        0,
      );
      const totalTax = (order.items || []).reduce(
        (s: number, it: any) =>
          s +
          (Number(it.quantity) || 0) *
            (Number(it.rate) || 0) *
            ((Number(it.taxPercent) || 0) / 100),
        0,
      );
      const grandTotal = subtotal - (Number(order.discount) || 0) + totalTax;

      const taxGroups: Record<string, { taxable: number; rate: number; taxAmt: number }> = {};
      (order.items || []).forEach((it: any) => {
        const hsn = it.hsn || it.hsnCode || 'NA';
        const line = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
        const rate = Number(it.taxPercent) || 0;
        const taxAmt = (line * rate) / 100;
        if (!taxGroups[hsn]) taxGroups[hsn] = { taxable: 0, rate, taxAmt: 0 };
        taxGroups[hsn].taxable += line;
        taxGroups[hsn].taxAmt += taxAmt;
        taxGroups[hsn].rate = rate;
      });

      const taxSummaryRows = Object.keys(taxGroups).map(hsn => {
        const g = taxGroups[hsn];
        return `<tr><td>${escapeHtml(hsn)}</td><td class="right">${formatCurrency(g.taxable)}</td><td class="center">${g.rate}%</td><td class="right">${formatCurrency(g.taxAmt)}</td></tr>`;
      }).join('');

      const taxableTotal = Object.values(taxGroups).reduce((s, g) => s + g.taxable, 0);
      const totalQuantity = (order.items || []).reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0);
      const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees only';

      const companyState = (order as any).state || '';
      const companyGstin = (order as any).gstin || '';
      const challanNoVal = (order as any).challanNo || order.id || '';
      const challanDateVal = (order as any).challanDate || new Date().toLocaleDateString();
      const termsText = (order as any).terms || 'Thank you for doing business with us.';

      const html = template
        .replace(/{{customerName}}/g, escapeHtml(order.customerName || ''))
        .replace(/{{phone}}/g, escapeHtml(order.phone || ''))
        .replace(/{{address}}/g, escapeHtml(order.address || ''))
        .replace(/{{companyName}}/g, escapeHtml('Hing Market Partner'))
        .replace(/{{companyAddress}}/g, escapeHtml('123 Business St., City, State - 400001'))
        .replace(/{{companyPhone}}/g, escapeHtml('+91 98765 43210'))
        .replace(/{{companyState}}/g, escapeHtml(companyState))
        .replace(/{{companyGSTIN}}/g, escapeHtml(companyGstin))
        .replace(/{{challanNo}}/g, escapeHtml(String(challanNoVal)))
        .replace(/{{challanDate}}/g, escapeHtml(challanDateVal))
        .replace(/{{placeOfSupply}}/g, escapeHtml(companyState))
        .replace(/{{items}}/g, itemsHtml)
        .replace(/{{taxSummaryRows}}/g, taxSummaryRows)
  .replace(/{{taxableTotal}}/g, formatCurrencyMobile(taxableTotal))
  .replace(/{{taxTotal}}/g, formatCurrencyMobile(totalTax))
        .replace(/{{subTotal}}/g, formatCurrencyMobile(subtotal))
        .replace(/{{totalQuantity}}/g, String(totalQuantity))
        .replace(/{{totalAmount}}/g, formatCurrencyMobile(grandTotal))
        .replace(/{{amountInWords}}/g, escapeHtml(amountInWords))
        .replace(/{{terms}}/g, escapeHtml(termsText))
        .replace(/{{signatureImage}}/g, '')
        .replace(/{{logo}}/g, escapeHtml((order as any).logo || ''))
        .replace(/{{fssai}}/g, escapeHtml((order as any).fssai || ''))
        .replace(/{{time}}/g, escapeHtml(new Date().toLocaleTimeString()));

      const file = await generatePDF({ html, fileName: `Invoice_${(order.customerName || 'customer').replace(/\s+/g, '_')}_${order.id}_mobile`, base64: false });
      const path = file.filePath;
      console.log('mobile pdf path:', path);

      const exists = await RNFS.exists(path);
      if (!exists) throw new Error('PDF file not found at: ' + path);

      const url = Platform.OS === 'android' ? `file://${path}` : path;
      await Share.open({ url, type: 'application/pdf' });
    } catch (err) {
      console.warn('Mobile PDF share error', err);
    }
  }

  function onEdit() {
    // close menu immediately when an action is chosen
    setIsMenuOpen(false);
    // navigate to AddEditOrder with order id
    navigation.navigate('AddEditOrder', { orderId: order.id });
  }

  function onDelete() {
    setIsMenuOpen(false);
    const confirm = require('react-native').Alert;
    confirm.alert(
      'Delete order',
      'Are you sure you want to delete this order? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeOrder(order.id));
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    // Make the icon touchable only — keep the menu view outside the touchable
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={menuHandler}>
        <View>
          <MaterialDesignIcons name="dots-vertical" color="black" size={32} />
        </View>
      </TouchableWithoutFeedback>

      {isMenuOpen && (
        <Animated.View style={[styles.menu, { height: heightStyle }]}>
          <View style={styles.menuInner}>
            <TouchableOpacity style={styles.menuItem} onPress={onSharePDF}>
              <MaterialDesignIcons name="share" size={18} color="#5b4037" />
              <Text style={styles.menuText}> Share PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onSharePDFMobile}>
              <MaterialDesignIcons name="share" size={18} color="#5b4037" />
              <Text style={styles.menuText}> Share PDF (Mobile)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
              <MaterialDesignIcons name="pencil" size={18} color="#5b4037" />
              <Text style={styles.menuText}> Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem]} onPress={onDelete}>
              <MaterialDesignIcons name="trash-can" size={18} color="#c62828" />
              <Text style={styles.menuTextDelete}> Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    top: 30,
    borderColor: 'gray',
    borderWidth: 1,
    width: 120,
    right: 14,
    padding: 5,
    zIndex: 2,
    backgroundColor: 'white',
    borderRadius: 5,
    borderTopEndRadius: 0,
  },
  container: {
    alignItems: 'center',
    zIndex: 2,
  },
  spacer: {
    height: 8,
  },
  menuInner: { paddingVertical: 6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  menuText: { color: '#5b4037', fontWeight: '600' },
  menuTextDelete: { color: '#c62828', fontWeight: '600' },
});
