import express from "express";
import { isAiAvailable, AiUnavailableError } from "../services/ai/geminiClient.js";
import { chat } from "../services/ai/financialAssistant.js";
import { generateInsights } from "../services/ai/insightsEngine.js";
import { predictExpenses } from "../services/ai/predictionEngine.js";
import { detectAnomalies } from "../services/ai/anomalyDetector.js";
import { recommendBudget } from "../services/ai/budgetRecommender.js";
import { calculateFinancialHealth } from "../services/ai/financialHealth.js";
import { parseNaturalLanguageSearch } from "../services/ai/nlpSearch.js";
import { suggestCategory } from "../services/ai/categorizer.js";
import { scanReceipt } from "../services/ai/receiptScanner.js";
import { parseVoiceExpenses } from "../services/ai/voiceParser.js";
import { getCategories } from "../services/categoryService.js";
import { listExpenses } from "../repositories/expenseRepository.js";
import { AiConversation } from "../models/AiConversation.js";

export const aiRouter = express.Router();

// Middleware: check if AI features are available
function requireAi(request, response, next) {
  if (!isAiAvailable()) {
    response.status(503).json({
      available: false,
      message: "AI features are not configured. Please set GEMINI_API_KEY in your environment."
    });
    return;
  }
  next();
}

// GET /api/ai/status — Check if AI features are available
aiRouter.get("/status", (_request, response) => {
  response.json({ available: isAiAvailable() });
});

// POST /api/ai/chat — AI Financial Assistant
aiRouter.post("/chat", requireAi, async (request, response) => {
  try {
    const { message, conversationId } = request.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      response.status(400).json({ message: "Message is required." });
      return;
    }

    if (message.length > 1000) {
      response.status(400).json({ message: "Message is too long. Maximum 1000 characters." });
      return;
    }

    // Load or create conversation
    let conversation;
    if (conversationId) {
      conversation = await AiConversation.findOne({ _id: conversationId, ownerId: request.user.id });
    }

    const history = conversation?.messages?.map(m => ({ role: m.role, content: m.content })) || [];
    const result = await chat(request.user.id, message.trim(), history);

    // Save conversation
    if (!conversation) {
      conversation = new AiConversation({
        ownerId: request.user.id,
        title: message.trim().slice(0, 80),
        messages: []
      });
    }

    conversation.messages.push({ role: "user", content: message.trim() });
    conversation.messages.push({ role: "assistant", content: result.message });

    // Keep only last 20 messages per conversation
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    await conversation.save();

    response.json({
      ...result,
      conversationId: conversation._id.toString()
    });
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/insights — AI Spending Insights
aiRouter.get("/insights", async (request, response) => {
  try {
    const result = await generateInsights(request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/prediction — Expense Prediction
aiRouter.get("/prediction", async (request, response) => {
  try {
    const result = await predictExpenses(request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/anomalies — Anomaly Detection
aiRouter.get("/anomalies", async (request, response) => {
  try {
    const result = await detectAnomalies(request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/budget — Smart Budget Recommendations
aiRouter.get("/budget", async (request, response) => {
  try {
    const result = await recommendBudget(request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/health — Financial Health Score
aiRouter.get("/health", async (request, response) => {
  try {
    const result = await calculateFinancialHealth(request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// POST /api/ai/search — Natural Language Search
aiRouter.post("/search", requireAi, async (request, response) => {
  try {
    const { query } = request.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      response.status(400).json({ message: "Search query is required." });
      return;
    }

    const categories = await getCategories(request.user.id, "expense");
    const categoryNames = categories.map(c => c.name);

    const { filters } = await parseNaturalLanguageSearch(query.trim(), categoryNames);

    // Execute the validated, sanitized search
    const expenses = await listExpenses(request.user.id, filters);

    // Apply client-side filters that aren't in the repository (min/max amount)
    let results = expenses;
    if (filters.minAmount) {
      results = results.filter(e => e.amount >= filters.minAmount);
    }
    if (filters.maxAmount) {
      results = results.filter(e => e.amount <= filters.maxAmount);
    }

    response.json({
      results: results.slice(0, 50),
      filters,
      totalResults: results.length,
      query: query.trim()
    });
  } catch (error) {
    handleAiError(error, response);
  }
});

// POST /api/ai/categorize — AI Category Suggestion
aiRouter.post("/categorize", async (request, response) => {
  try {
    const { description } = request.body;

    if (!description || typeof description !== "string") {
      response.status(400).json({ message: "Description is required." });
      return;
    }

    const categories = await getCategories(request.user.id, "expense");
    const categoryNames = categories.map(c => c.name);

    const result = await suggestCategory(description.trim(), categoryNames, request.user.id);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// POST /api/ai/scan-receipt — Receipt Scanning
aiRouter.post("/scan-receipt", requireAi, async (request, response) => {
  try {
    // Handle multipart upload inline (multer middleware applied in app.js)
    if (!request.file) {
      response.status(400).json({ message: "Receipt image is required. Upload an image file." });
      return;
    }

    const result = await scanReceipt(request.file.buffer, request.file.mimetype);
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// POST /api/ai/parse-voice — Voice Expense Entry Parsing
aiRouter.post("/parse-voice", async (request, response) => {
  try {
    const { text } = request.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      response.status(400).json({ message: "Voice transcript text is required." });
      return;
    }

    const result = await parseVoiceExpenses(request.user.id, text.trim());
    response.json(result);
  } catch (error) {
    handleAiError(error, response);
  }
});

// GET /api/ai/conversations — List user's recent conversations
aiRouter.get("/conversations", async (request, response) => {
  try {
    const conversations = await AiConversation.find({ ownerId: request.user.id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("title messages updatedAt")
      .lean();

    response.json(conversations.map(c => ({
      id: c._id.toString(),
      title: c.title,
      messageCount: c.messages.length,
      lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].content.slice(0, 100) : "",
      updatedAt: c.updatedAt
    })));
  } catch (error) {
    handleAiError(error, response);
  }
});

function handleAiError(error, response) {
  if (error instanceof AiUnavailableError) {
    response.status(503).json({ available: false, message: error.message });
    return;
  }

  console.error("[AI Error]", error.message);
  response.status(error.statusCode || 500).json({
    message: error.message || "AI service encountered an error. Please try again.",
    available: true
  });
}
