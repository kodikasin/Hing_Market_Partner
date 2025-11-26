import { Platform } from 'react-native';
import { OrderItem } from '../store/realmSchemas';

export const itemsTotalQuantity = (items: OrderItem[]) => {
  let quantity = 0;
  items.forEach(item => {
    quantity = quantity + item.quantity;
  });

  return quantity;
};
export const itemsTotalAmount = (items: OrderItem[]) => {
  let amount = 0;
  items.forEach(item => {
    amount = amount + (item?.total || 0);
  });

  return amount;
};

export function numberToWords(items: OrderItem[]) {
  const num = itemsTotalAmount(items);
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
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function twoDigit(n: number) {
    if (n < 20) return a[n];
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return b[tens] + (rest ? ' ' + a[rest] : '');
  }

  function threeDigit(n: number) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (
      (hundred ? a[hundred] + ' Hundred' + (rest ? ' ' : '') : '') +
      (rest ? twoDigit(rest) : '')
    );
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

import RNFS from 'react-native-fs';
import Share from 'react-native-share';

type ShareFileData = {
  path:string;
  customerName:string;
  orderId:string;
}

export const shareFile = async({path = '',customerName='',orderId=''}:ShareFileData) => {
   const exists = await RNFS.exists(path);
      if (!exists) throw new Error('PDF file not found at: ' + path);

      // react-native-share works with file:// URIs on Android and direct path on iOS
      const url = Platform.OS === 'android' ? `file://${path}` : path;

      const shareOptions = {
        url,
        type: 'application/pdf',
        filename: `Invoice_${customerName}_${orderId}`,
        subject: `Invoice for ${customerName}`,
        message: `Invoice for ${customerName}`,
      };

      await Share.open(shareOptions);
}