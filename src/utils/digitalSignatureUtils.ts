import QRCode from 'qrcode';
import { DigitalSignature, UserAccount, Patient } from '../types';

/**
 * Calculates SHA-256 hash using Web Crypto API with fallback
 */
export async function generateSha256Hash(input: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto unavailable, using fallback hash calculation', e);
  }

  // Fallback simple hash generator formatted as 64 hex characters (256-bit representation)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x811c9dc5;
  let h4 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const raw = `${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h1 ^ h3)}${toHex(h2 ^ h4)}${toHex(h1 + h2)}${toHex(h3 + h4)}`;
  return raw.padEnd(64, 'a').substring(0, 64);
}

/**
 * Generates a full digital signature with SHA-256 hash and QR Code
 */
export async function createDigitalSignature(params: {
  professionalName: string;
  professionalCouncil: string;
  cpf?: string;
  patientName: string;
  patientId: string;
  documentTitle: string;
  documentType: string;
  ip?: string;
}): Promise<DigitalSignature> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const signedAt = `${dateStr} às ${timeStr}`;
  const signedAtIso = now.toISOString();

  // Detected or fallback IP
  const clientIp = params.ip || '177.136.240.82';
  const cpfFormatted = params.cpf ? params.cpf.trim() : '***.***.***-**';

  // Seed payload for SHA-256: combines Professional, CRN/CRM, CPF, Timestamp, Client IP, and Document data
  const payloadToHash = JSON.stringify({
    professional: params.professionalName,
    council: params.professionalCouncil,
    cpf: cpfFormatted,
    signedAt: signedAtIso,
    ip: clientIp,
    patientId: params.patientId,
    patientName: params.patientName,
    docType: params.documentType,
    docTitle: params.documentTitle,
    salt: Math.random().toString(36).substring(2, 10)
  });

  const hash = await generateSha256Hash(payloadToHash);
  const shortCode = `${hash.substring(0, 8)}-${hash.substring(8, 16)}`.toUpperCase();
  const verificationUrl = `https://nutrink.com.br/validar/${hash}`;

  let qrCodeUrl = '';
  try {
    qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#1e073c',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error creating QR Code data URL:', err);
  }

  return {
    signed: true,
    signedAt,
    signedAtIso,
    signedBy: params.professionalName,
    professionalCouncil: params.professionalCouncil,
    cpf: cpfFormatted,
    ip: clientIp,
    hash,
    verificationCode: shortCode,
    verificationUrl,
    qrCodeUrl
  };
}
