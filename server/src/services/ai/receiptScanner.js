import { generateJSONFromImage } from "./geminiClient.js";

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Scan a receipt image and extract transaction details using Gemini Vision.
 */
export async function scanReceipt(imageBuffer, mimeType) {
  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image format. Please upload JPEG, PNG, WebP, or GIF.`);
  }

  if (imageBuffer.length > MAX_FILE_SIZE) {
    throw new Error("Image file is too large. Maximum size is 10MB.");
  }

  const prompt = `Analyze this receipt image and extract the following information.
Return a JSON object with these fields:

{
  "merchant": "store/restaurant name or null if unreadable",
  "date": "YYYY-MM-DD format or null if unreadable",
  "totalAmount": numeric amount or null,
  "currency": "INR" or detected currency code,
  "category": one of "Food", "Shopping", "Bills", "Travel", "Entertainment" or best guess,
  "items": [{"name": "item name", "amount": numeric}] or empty array if not readable,
  "confidence": 0-100 overall confidence in the extraction,
  "notes": "any additional relevant info from the receipt"
}

Rules:
- Extract the TOTAL/GRAND TOTAL amount, not subtotals
- If amounts are in Indian Rupees (₹ or Rs.), set currency to "INR"
- If you can't read a field clearly, set it to null
- Be conservative with confidence — low confidence for blurry/partial receipts
- Items array should only include items you can clearly read`;

  const result = await generateJSONFromImage(prompt, imageBuffer, mimeType);

  // Validate and sanitize the response
  return sanitizeReceiptData(result);
}

function sanitizeReceiptData(data) {
  const sanitized = {
    merchant: typeof data.merchant === "string" ? data.merchant.slice(0, 200) : null,
    date: null,
    totalAmount: null,
    currency: "INR",
    category: null,
    items: [],
    confidence: 0,
    notes: typeof data.notes === "string" ? data.notes.slice(0, 500) : "",
    needsVerification: true
  };

  // Validate date
  if (data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    sanitized.date = data.date;
  }

  // Validate amount
  if (typeof data.totalAmount === "number" && data.totalAmount > 0) {
    sanitized.totalAmount = Math.round(data.totalAmount * 100) / 100;
  }

  // Validate currency
  if (typeof data.currency === "string" && data.currency.length === 3) {
    sanitized.currency = data.currency.toUpperCase();
  }

  // Validate category
  const validCategories = ["Food", "Shopping", "Bills", "Travel", "Entertainment"];
  if (data.category && validCategories.some(c => c.toLowerCase() === String(data.category).toLowerCase())) {
    sanitized.category = validCategories.find(c => c.toLowerCase() === String(data.category).toLowerCase());
  }

  // Validate items
  if (Array.isArray(data.items)) {
    sanitized.items = data.items
      .filter(item => item && typeof item.name === "string")
      .slice(0, 20)
      .map(item => ({
        name: item.name.slice(0, 100),
        amount: typeof item.amount === "number" ? Math.round(item.amount * 100) / 100 : null
      }));
  }

  // Validate confidence
  if (typeof data.confidence === "number") {
    sanitized.confidence = Math.max(0, Math.min(100, Math.round(data.confidence)));
  }

  // Mark as needing verification if confidence is below threshold
  sanitized.needsVerification = sanitized.confidence < 80 || !sanitized.totalAmount || !sanitized.date;

  return sanitized;
}
