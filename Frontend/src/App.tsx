import React, { useState, useEffect } from "react";
import {
  generateAESKey,
  aesEncrypt,
  rsaEncryptKey,
  getRSAPublicKey,
  updateRSAPublicKey
} from "./utils/encryption";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [jsonInput, setJsonInput] = useState("{}");
  const [encryptedPayload, setEncryptedPayload] = useState("");
  const [headersPreview, setHeadersPreview] = useState<any>({});
  const [response, setResponse] = useState<any>(null);
  const [publicKeyLoaded, setPublicKeyLoaded] = useState(false);

  useEffect(() => {
    getRSAPublicKey().then(() => setPublicKeyLoaded(true));
  }, []);

  async function handleSend() {
    if (!publicKeyLoaded) return alert("Public key not loaded yet.");

    try {
      // 1. Generate AES key and encrypt payload
      const aesKey = await generateAESKey();
      const { cipherBase64, ivHex } = await aesEncrypt(jsonInput, aesKey);

      // 2. Encrypt AES key with RSA
      const encryptedKeyBase64 = await rsaEncryptKey(aesKey);

      // 3. Build headers
      const timestamp = Date.now().toString();
      const nonce = uuidv4();
      const headers = {
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Enc-Key": encryptedKeyBase64,
        "X-IV": ivHex,
        "Content-Type": "application/json"
      };

      setEncryptedPayload(cipherBase64);
      setHeadersPreview(headers);

      // 4. Send request
      const res = await fetch("https://hybridshield.onrender.com/api/secure", {
        method: "POST",
        headers,
        body: cipherBase64
      });

      const data = await res.json();
      setResponse(data);

      // 5. Update public key for next request if server provides it
      if (data?.result?.pub_key) {
        updateRSAPublicKey(data.result.pub_key);
      }

    } catch (err) {
      console.error(err);
      setResponse({ error: "Encryption or request failed" });
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Secure Payload Punch</h1>

      {!publicKeyLoaded && <p className="text-red-500">Loading public key...</p>}

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        className="border rounded p-2 w-full h-40"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!publicKeyLoaded}
      >
        Encrypt & Send
      </button>

      {encryptedPayload && (
        <div className="bg-gray-100 p-4 rounded overflow-auto">
          <h2 className="font-bold mb-2">Encrypted Payload</h2>
          <pre className="text-xs  break-words whitespace-pre-wrap">{encryptedPayload}</pre>
          <h2 className="font-bold mt-4 mb-2">Headers</h2>
          <pre className="text-xs  break-words whitespace-pre-wrap">{JSON.stringify(headersPreview, null, 2)}</pre>
        </div>
      )}

      {response && (
        <div className="bg-green-100 p-4 rounded overflow-auto">
          <h2 className="font-bold mb-2">Server Response</h2>
          <pre className="text-xs break-words whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
