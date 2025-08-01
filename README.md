# **HybridShield** 🔐

A **hybrid encryption demo** for securing API payloads using **AES‑GCM + RSA‑OAEP**, inspired by **TEMU’s advanced app encryption flow**.  

HybridShield demonstrates how to **lock down your app’s sensitive routes** so that any unauthorized request becomes **useless** without the correct encrypted payload.

---

## **✨ Features**

- **Hybrid Encryption**: AES‑GCM for fast encryption + RSA‑OAEP for secure key exchange  
- **Per‑Request AES Keys**: New session key generated for each request  
- **Replay Protection**: Nonce + timestamp validation  
- **Temu‑style Security**: Mimics real‑world mobile app encryption flows  
- **Easy Integration**: React + Node.js example you can adapt to any app

---

## **📂 Project Structure**


---

## **🚀 Getting Started**

### **1. Clone the Repository**

```bash
git clone https://github.com/YOUR_USERNAME/hybridshield.git
cd hybridshield
```
### **2. Backend Setup**

```bash
cd API
npm install
npm run dev
```
Backend starts on http://localhost:3000 by default.

### **3. Frontend Setup**

```bash
cd ../Frontend
npm install
npm run dev
```
Frontend starts on http://localhost:8080 (Vite default).

#### **Important: Set the API URL in your .env file:**

```bash
VITE_API_URL=http://localhost:3000
```

#### **Even if an attacker captures your traffic:**

🔐 Without the server’s RSA private key, the AES key is unrecoverable

🚫 Requests with incorrect encryption are ignored

⏱ Replay attacks are blocked by nonce & timestamp

## **Why Use HybridShield?**
**Use HybridShield in your app even for just registration, login, and sensitive endpoints to:**

✅ Prevent brute‑force & replay attacks

✅ Make intercepted traffic useless

✅ Ensure only valid, encrypted requests reach your backend

**If the backend doesn’t get exactly what it expects, the request is dead on arrival. 🚫**

## **Lessons From Breaking My Teeth on Temu’s Flow**
**While poking at Temu’s setup, I tried every trick in the book to find weaknesses, but their flow held up like a fortress.**

**Still, here’s what devs should watch out for:**
- Nonce Reuse – Reusing nonces can break replay protection → always use cryptographically secure random numbers
- Weak RSA Keys – Keys <2048 bits are dangerous → stick with 2048 or higher
- Key Rotation – Rotate keys regularly → Temu even rotates RSA keys via a separate route, like changing your locks
- Per‑Request AES Keys – Temu generates a fresh AES key per request (brilliant!)
- Tight Timestamp Validation – Too loose, and you risk limited replay attacks


## **🙏 Credits**
TEMU’s engineering team for their rock‑solid hybrid encryption

PortSwigger’s Bambda function, which saved me during the entire app analysis process


