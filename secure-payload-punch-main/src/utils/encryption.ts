import forge from "node-forge";

let RSA_PUBLIC_KEY: string | null = null;

// Fetch or update the public key
export async function getRSAPublicKey(): Promise<string> {
  if (!RSA_PUBLIC_KEY) {
    const res = await fetch("https://hybridshield.onrender.com/api/public-key");
    RSA_PUBLIC_KEY = await res.text();
  }
  return RSA_PUBLIC_KEY;
}

// Allow updating public key dynamically
export function updateRSAPublicKey(pemOrBase64: string) {
  // If server sends Base64 (ASN.1) pub key like Temu
  if (!pemOrBase64.includes("BEGIN")) {
    const der = forge.util.decode64(pemOrBase64);
    const asn1 = forge.asn1.fromDer(der);
    const pubKey = forge.pki.publicKeyFromAsn1(asn1);
    RSA_PUBLIC_KEY = forge.pki.publicKeyToPem(pubKey);
  } else {
    RSA_PUBLIC_KEY = pemOrBase64; // If PEM is sent directly
  }
}

export async function generateAESKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export async function aesEncrypt(data: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return {
    cipherBase64: arrayBufferToBase64(encrypted),
    ivHex: arrayBufferToHex(iv.buffer)
  };
}

export async function rsaEncryptKey(aesKey: CryptoKey) {
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", aesKey));
  const rawBinary = Array.from(rawKey).map(b => String.fromCharCode(b)).join("");

  const publicKeyPem = await getRSAPublicKey();
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encryptedBytes = publicKey.encrypt(rawBinary, "RSA-OAEP");
  return forge.util.encode64(encryptedBytes);
}
