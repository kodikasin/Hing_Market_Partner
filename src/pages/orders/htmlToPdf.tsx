import { address } from '../../store/realmSchemas';

export type IData = {
  companyName?: string;
  companyAddress?: address;
  companyPhone?: string;
  companyState?: string;
  companyGSTIN?: string;
  customerName?: string;
  customerAddressLine?: string;
  challanNo?: string;
  challanDate?: string;
  placeOfSupply?: string;
  items?: any[];
  totalQuantity?: any;
  taxTotal?: any;
  totalAmount?: any;
  taxSummary?: any[];
  taxableTotal?: any;
  subTotal?: any;
  amountInWords?: string;
  terms?: string;
  companyShort?: string;
  signatureImage?: string;
};

export const generateDeliveryChallanHtml = ({
  companyName = '',
  companyAddress = {},
  companyPhone = '',
  companyState = '',
  companyGSTIN = '',
  customerName = '',
  customerAddressLine = '',
  challanNo = '',
  challanDate = '',
  placeOfSupply = '',
  items = [],
  totalQuantity = '',
  taxTotal = '',
  totalAmount = '',
  taxSummary = [],
  taxableTotal = '',
  subTotal = '',
  amountInWords = '',
  terms = '',
  companyShort = '',
  signatureImage = '', // data URL or remote URL
}: IData) => {
  // Format address object to string
  const addressStr =
    typeof companyAddress === 'object' && companyAddress
      ? `${(companyAddress as any).street || ''}, ${
          (companyAddress as any).city || ''
        }, ${(companyAddress as any).state || ''}, ${
          (companyAddress as any).pincode || ''
        }`
          .replace(/,\s*$/, '')
          .replace(/,\s*,/g, ',')
      : (companyAddress as string);

  const itemsRowsHtml = items
    .map((item, index) => {
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${item.name + ' ( ' + item.quantity + ' g ' + ' ) '}</td>
          <td class="center">${item.hsn || ''}</td>
          <td class="center">${item.quantity}</td>
          <td class="center">${item.unit || ''}</td>
          <td class="right">${item.rate?.toFixed?.(2) ?? ''}</td>
          <td class="right">${item.tax?.toFixed?.(2) ?? ''}</td>
          <td class="right">${item.total?.toFixed?.(2) ?? ''}</td>
        </tr>
      `;
    })
    .join('');

  const taxSummaryRowsHtml = taxSummary
    .map(row => {
      return `
        <tr>
          <td>${row.hsn}</td>
          <td class="right">
          ${row.taxableAmount?.toFixed?.(2) ?? row.taxableAmount}</td>
          <td class="center">${row.igstRate}</td>
          <td class="right">
          ${row.igstAmount?.toFixed?.(2) ?? row.igstAmount}</td>
          <td class="right">${row.totalTax?.toFixed?.(2) ?? row.totalTax}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Delivery Challan</title>
  <style>
    body{font-family: 'Helvetica Neue', Arial, sans-serif; color:#222; margin:0; padding:18px; background:#fff}
    .sheet{max-width:1000px;margin:0 auto;border:1px solid #344055;padding:10px}
    .title{text-align:center;font-size:28px;font-weight:700;color:#2b2b39;margin-bottom:6px}
    .companyBox{border:1px solid #344055;padding:10px}
    .companyName{font-size:16px;font-weight:800}
    .small{font-size:12px;color:#333}
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
      <!-- Company + GST row -->
      <table style="width:100%; border-collapse:collapse; border:none;">
        <tr>
          <td style="border:none; vertical-align:top;">
            <div class="companyName">${companyName}</div>
            <div class="small">${addressStr}</div>
            <div class="small">Phone: ${companyPhone}</div>
            <div class="small">State: ${companyState}</div>
          </td>
          <td style="border:none; vertical-align:top; text-align:right; width:40%;">
            <div class="small"><strong>GSTIN:</strong> ${companyGSTIN}</div>
          </td>
        </tr>
      </table>

      <!-- Customer + Challan details row -->
      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        <tr>
          <td style="border:1px solid #cfcfd6; padding:6px; vertical-align:top;">
            <div style="font-weight:700">Delivery Challan for</div>
            <div style="margin-top:6px">${customerName}<br/>${customerAddressLine}</div>
          </td>
          <td style="border:1px solid #cfcfd6; padding:6px; vertical-align:top; width:320px;">
            <div style="font-weight:700">Challan Details:</div>
            <div style="margin-top:6px">
              No: ${challanNo}<br/>
              Date: ${challanDate}<br/>
              Place of Supply: ${placeOfSupply}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items table -->
    <div class="section">
      <table>
        <thead>
          <tr>
            <th style="width:4%">#</th>
            <th style="width:30%">Item Name</th>
            <th style="width:10%">HSN / SAC</th>
            <th style="width:8%" class="center">Quantity(g)</th>
            <th style="width:8%" class="center">Unit</th>
            <th style="width:12%" class="right">Price/ Unit (₹)</th>
            <th style="width:10%" class="right">GST(%)</th>
            <th style="width:12%" class="right">Amount(₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
          <tr>
            <td colspan="3" class="right" style="font-weight:700">Total</td>
            <td class="center">${totalQuantity}</td>
            <td class="no-border"></td>
            <td class="no-border"></td>
            <td class="right" style="font-weight:700">${taxTotal}</td>
            <td class="right" style="font-weight:700">${totalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tax summary + amount summary 2-column layout -->
    <div class="section" style="margin-top:8px">
      <table style="width:100%; border-collapse:collapse; border:none;">
        <tr>
          <td style="border:none; vertical-align:top;">
            <div style="font-weight:700">Tax Summary:</div>
            <table class="taxSummary" style="margin-top:6px">
              <thead>
                <tr>
                  <th style="width:20%">HSN/ SAC</th>
                  <th style="width:30%">Taxable Amount (₹)</th>
                  <th style="width:12%">IGST Rate (%)</th>
                  <th style="width:12%">Amt (₹)</th>
                  <th style="width:16%">Total Tax(₹)</th>
                </tr>
              </thead>
              <tbody>
                ${taxSummaryRowsHtml}
                <tr>
                  <td style="font-weight:700">TOTAL</td>
                  <td class="right" style="font-weight:700">${taxableTotal}</td>
                  <td></td>
                  <td class="right" style="font-weight:700">${taxTotal}</td>
                  <td class="right" style="font-weight:700">${taxTotal}</td>
                </tr>
              </tbody>
            </table>
          </td>
          <td style="border:none; vertical-align:top; width:320px;">
            <table class="summaryTable">
              <tbody>
                <tr>
                  <td>Sub Total</td>
                  <td class="right">${subTotal}</td>
                </tr>
                <tr>
                  <td>Total</td>
                  <td class="right">${totalAmount}</td>
                </tr>
                <tr>
                  <td>Delivery Challan Amount In Words :</td>
                  <td class="right" style="font-weight:700">${amountInWords}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Terms -->
    <div class="section terms">
      <div style="font-weight:700">Terms And Conditions:</div>
      <div class="muted" style="margin-top:6px">${terms}</div>
    </div>

    <!-- Signatures -->
    <div class="section" style="margin-top:8px">
      <table style="width:100%;border-collapse:collapse" class="signTable">
        <thead>
          <tr>
            <th>Received By:</th>
            <th>Delivered By:</th>
            <th>For ${companyShort}:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align:top;padding:8px">
              Name:<br/>Comment:<br/>Date:<br/>Signature:
            </td>
            <td style="vertical-align:top;padding:8px">
              Name:<br/>Comment:<br/>Date:<br/>Signature:
            </td>
            <td style="vertical-align:top;padding:8px;text-align:center">
              &nbsp;<br/>
              ${
                signatureImage
                  ? `<img src="${signatureImage}" style="max-width:120px;max-height:60px" alt="signature"/>`
                  : ''
              }
              <br/>Authorized Signatory
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</body>
</html>
`;
};
