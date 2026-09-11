import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadEnv } from "../../utils/env.js";

let genAI = null;
let model = null;
let visionModel = null;

const REQUEST_TIMEOUT_MS = 30000;
const MAX_OUTPUT_TOKENS = 2048;

function getApiKey() {
  loadEnv();
  return process.env.GEMINI_API_KEY || "";
}

function getModelName() {
  loadEnv();
  return process.env.GEMINI_MODEL || "gemini-3.6-flash";
}

function ensureClient() {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  if (!genAI) {
    const modelName = getModelName();
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3
      }
    });
    visionModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.2
      }
    });
  }

  return true;
}

export function isAiAvailable() {
  return Boolean(getApiKey());
}

/**
 * Send a text prompt to Gemini and return the text response.
 */
export async function generateText(systemPrompt, userPrompt) {
  if (!ensureClient()) {
    throw new AiUnavailableError();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const chat = model.startChat({
      history: [{ role: "user", parts: [{ text: systemPrompt }] }, { role: "model", parts: [{ text: "Understood. I will follow these instructions." }] }]
    });

    const result = await chat.sendMessage(userPrompt);
    const response = result.response;
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Send a structured prompt expecting JSON response.
 */
export async function generateJSON(systemPrompt, userPrompt) {
  const raw = await generateText(
    systemPrompt + "\n\nIMPORTANT: Respond with valid JSON only. No markdown code fences, no explanation outside the JSON.",
    userPrompt
  );

  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON response.");
  }
}

/**
 * Send an image + prompt to Gemini Vision.
 */
export async function generateFromImage(prompt, imageBuffer, mimeType) {
  if (!ensureClient()) {
    throw new AiUnavailableError();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType
      }
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response;
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Send an image + prompt expecting JSON response.
 */
export async function generateJSONFromImage(prompt, imageBuffer, mimeType) {
  const raw = await generateFromImage(
    prompt + "\n\nIMPORTANT: Respond with valid JSON only. No markdown code fences.",
    imageBuffer,
    mimeType
  );

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON response from image analysis.");
  }
}

export class AiUnavailableError extends Error {
  constructor() {
    super("AI features are not configured. Please set GEMINI_API_KEY in your environment.");
    this.name = "AiUnavailableError";
    this.statusCode = 503;
  }
}
