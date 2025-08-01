const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const forge = require("node-forge");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors({ origin: "http://localhost:8080" }));
app.use(bodyParser.text({ type: "application/json" }));

// RSA keys
const keypair = forge.pki.rsa.generateKeyPair(2048);
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);

// HMAC secret for signing responses
const SERVER_HMAC_SECRET = "super_server_secret_456";

// Serve the current RSA public key
app.get("/api/public-key", (req, res) => {
  res.type("text/plain").send(publicKeyPem);
});

// RSA decrypt (returns 32-byte Buffer)
function rsaDecrypt(encryptedBase64) {
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  const decryptedBinary = keypair.privateKey.decrypt(encryptedBytes, "RSA-OAEP");
  return Buffer.from(decryptedBinary, "binary");
}

// AES-GCM decryption
function aesDecrypt(encryptedBase64, aesKeyBuffer, ivHex) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    aesKeyBuffer,
    Buffer.from(ivHex, "hex")
  );

  const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
  const tag = encryptedBuffer.slice(encryptedBuffer.length - 16);
  const encryptedData = encryptedBuffer.slice(0, encryptedBuffer.length - 16);

  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// HMAC signature helper
function generateHMACSignature(bodyString) {
  return crypto.createHmac("sha256", SERVER_HMAC_SECRET)
               .update(bodyString)
               .digest("hex");
}

// Main secure endpoint
app.post("/api/secure", (req, res) => {
  try {
    const encKeyBase64 = req.header("X-Enc-Key");
    const ivHex = req.header("X-IV");
    const encryptedBody = req.body;

    // 1. Decrypt AES session key
    const aesKeyBuffer = rsaDecrypt(encKeyBase64);

    // 2. Decrypt JSON payload
    const decryptedJSON = aesDecrypt(encryptedBody, aesKeyBuffer, ivHex);
    console.log("Decrypted JSON:", decryptedJSON);

    // 3. Build Temu-style response
    const serverTime = Math.floor(Date.now() / 1000);
    const serverNonce = uuidv4().replace(/-/g, "");
    const salt = crypto.randomBytes(8).toString("hex");

    // Convert PEM public key to Base64 (without headers)
    const pubKeyAsn1 = forge.pki.publicKeyToAsn1(keypair.publicKey);
    const pubKeyDer = forge.asn1.toDer(pubKeyAsn1).getBytes();
    const pubKeyBase64 = Buffer.from(pubKeyDer, "binary").toString("base64");

    const result = {
      decryptedMessage: decryptedJSON,
      pub_key: pubKeyBase64,
      key_version: 1,
      salt: salt,
      server_time: serverTime,
      nonce: serverNonce
    };

    // 4. Sign response
    const bodyToSign = JSON.stringify(result);
    const sign = generateHMACSignature(bodyToSign);
    result.sign = sign;

    // 5. Send final JSON
    res.json({
      success: true,
      error_code: 1000000,
      result
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Secure API listening on port 3000");
});
