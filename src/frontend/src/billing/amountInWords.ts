const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
}

export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  
  let rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) {
    const crores = Math.floor(rupees / 10000000);
    result += convertLessThanThousand(crores) + ' Crore ';
    rupees = rupees % 10000000;
  }
  
  if (rupees >= 100000) {
    const lakhs = Math.floor(rupees / 100000);
    result += convertLessThanThousand(lakhs) + ' Lakh ';
    rupees = rupees % 100000;
  }
  
  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000);
    result += convertLessThanThousand(thousands) + ' Thousand ';
    rupees = rupees % 1000;
  }
  
  if (rupees > 0) {
    result += convertLessThanThousand(rupees) + ' ';
  }
  
  result += 'Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result.trim() + ' Only';
}
