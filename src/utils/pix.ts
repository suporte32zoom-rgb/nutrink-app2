/**
 * Utilitário de Geração de Código PIX Padrão Banco Central do Brasil (EMV / BR Code)
 * Chave PIX Oficial NutrinK e Configuração de Pagamento
 */

export const PIX_CPF_KEY = '321.785.4448/94';
export const PIX_CPF_CLEAN = '321785444894';
export const PIX_RECEIVER_NAME = 'NutrinK';
export const PIX_RECEIVER_CITY = 'Sao Paulo';

/**
 * BR Code Oficial (Copia e Cola) registrado no Banco Central para o Plano Anual NutrinK (R$ 899,00)
 */
export const OFFICIAL_PIX_ANNUAL_BR_CODE = '00020126860014br.gov.bcb.pix0136484e40dd-f971-41e9-b414-b56421b5d2410224Assinatura AnualPlano 125204000053039865406899.005802BR5907NutrinK6009Sao Paulo62230519daqr28493713595126463044291';
export const OFFICIAL_PIX_ANNUAL_AMOUNT = 899.00;
export const OFFICIAL_PIX_MONTHLY_AMOUNT = 89.90;

function padTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16Ccitt(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i);
    crc ^= (byte << 8);
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(amount: number, description: string = 'NutrinK Premium', txId: string = 'NUTRINK'): string {
  // Se for o valor oficial do Plano Anual (R$ 899,00), retorna o BR Code oficial validado
  if (Math.abs(amount - OFFICIAL_PIX_ANNUAL_AMOUNT) < 0.01 || description.toLowerCase().includes('anual')) {
    return OFFICIAL_PIX_ANNUAL_BR_CODE;
  }

  // Format amount to 2 decimal places
  const formattedAmount = amount.toFixed(2);

  // Field 26: Merchant Account Information
  const gui = padTag('00', 'br.gov.bcb.pix');
  // Chave PIX: usamos a chave fornecida
  const key = padTag('01', PIX_CPF_KEY);
  const desc = description ? padTag('02', description.substring(0, 25)) : '';
  const merchantAccountInfo = padTag('26', `${gui}${key}${desc}`);

  // Format indicator
  const payloadFormat = padTag('00', '01');
  const merchantCategory = padTag('52', '0000');
  const currency = padTag('53', '986'); // BRL
  const transactionAmount = padTag('54', formattedAmount);
  const countryCode = padTag('58', 'BR');
  const merchantName = padTag('59', PIX_RECEIVER_NAME.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25));
  const merchantCity = padTag('60', PIX_RECEIVER_CITY.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15));

  // Field 62: Additional Data Field (TxId)
  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || '***';
  const additionalData = padTag('62', padTag('05', cleanTxId));

  // Build string without CRC
  const rawPayload = `${payloadFormat}${merchantAccountInfo}${merchantCategory}${currency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;

  // Calculate CRC16
  const crc = crc16Ccitt(rawPayload);

  return `${rawPayload}${crc}`;
}

export function getPixQrCodeUrl(payload: string): string {
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encoded}&color=150328&bgcolor=ffffff&margin=10`;
}

