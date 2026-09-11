import { generateText } from "./geminiClient.js";
import { buildFinancialContext } from "./dataAggregator.js";

const SYSTEM_PROMPT = `You are FinTrack AI, a personal financial assistant embedded in a personal finance tracking application.

RULES:
- You ONLY discuss the user's personal finances using the data provided below.
- Every numerical claim must come from the provided data context. Do NOT invent numbers.
- If the user asks about data you don't have, say so honestly.
- Format currency values in Indian Rupees (₹) with proper formatting.
- Be concise, helpful, and actionable.
- Do not provide professional financial advice or legal/tax advice.
- Do not discuss other users' data, investments, stock picks, or cryptocurrency.
- Use markdown formatting for readability (bold for key numbers, bullet points for lists).
- Keep responses under 400 words unless the user asks for detailed analysis.`;

/**
 * Handle a user's chat message with financial context.
 */
export async function chat(ownerId, userMessage, conversationHistory = []) {
  const context = await buildFinancialContext(ownerId);

  // Build context string from aggregated data (no raw transactions sent for simple queries)
  const dataContext = formatContextForAI(context);

  const fullSystemPrompt = `${SYSTEM_PROMPT}

USER'S FINANCIAL DATA:
${dataContext}`;

  // Build conversation for multi-turn
  let fullPrompt = userMessage;
  if (conversationHistory.length > 0) {
    const historyText = conversationHistory
      .slice(-6) // Keep last 6 messages for context window management
      .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n");
    fullPrompt = `Previous conversation:\n${historyText}\n\nUser's new message: ${userMessage}`;
  }

  const response = await generateText(fullSystemPrompt, fullPrompt);
  return {
    message: response,
    type: "chat_response"
  };
}

function formatContextForAI(context) {
  const lines = [];

  lines.push(`Current Month: ${context.currentMonth}`);
  lines.push(`Currency: ${context.currency}`);
  lines.push("");
  lines.push("=== SUMMARY ===");
  lines.push(`Total Income (this month): ₹${context.summary.currentMonthIncome}`);
  lines.push(`Total Expenses (this month): ₹${context.summary.currentMonthExpenses}`);
  lines.push(`Current Balance (this month): ₹${context.summary.currentBalance}`);
  lines.push(`Total Income (last month): ₹${context.summary.previousMonthIncome}`);
  lines.push(`Total Expenses (last month): ₹${context.summary.previousMonthExpenses}`);

  if (context.summary.expenseChangePercent !== null) {
    lines.push(`Expense Change vs Last Month: ${context.summary.expenseChangePercent}%`);
  }
  if (context.summary.savingsRate !== null) {
    lines.push(`Current Savings Rate: ${context.summary.savingsRate}%`);
  }

  lines.push(`Total Transactions (all time): ${context.summary.transactionCount}`);
  lines.push(`Total Income Entries (all time): ${context.summary.incomeCount}`);

  if (context.budget) {
    lines.push("");
    lines.push("=== BUDGET ===");
    lines.push(`Monthly Budget: ₹${context.budget.amount}`);
    lines.push(`Spent: ₹${context.budget.spent}`);
    lines.push(`Remaining: ₹${context.budget.remaining}`);
  }

  lines.push("");
  lines.push("=== CATEGORY BREAKDOWN (this month) ===");
  for (const [category, total] of Object.entries(context.categoryBreakdown.currentMonth)) {
    lines.push(`${category}: ₹${total}`);
  }

  if (Object.keys(context.categoryBreakdown.previousMonth).length > 0) {
    lines.push("");
    lines.push("=== CATEGORY BREAKDOWN (last month) ===");
    for (const [category, total] of Object.entries(context.categoryBreakdown.previousMonth)) {
      lines.push(`${category}: ₹${total}`);
    }
  }

  lines.push("");
  lines.push("=== MONTHLY EXPENSE TREND ===");
  for (const entry of context.monthlyTrend) {
    lines.push(`${entry.month}: ₹${entry.total}`);
  }

  lines.push("");
  lines.push("=== MONTHLY INCOME TREND ===");
  for (const entry of context.monthlyIncomeTrend) {
    lines.push(`${entry.month}: ₹${entry.total}`);
  }

  if (context.recentExpenses.length > 0) {
    lines.push("");
    lines.push("=== RECENT EXPENSES (last 20) ===");
    for (const expense of context.recentExpenses) {
      lines.push(`${expense.date} | ${expense.category} | ${expense.description} | ₹${expense.amount} | ${expense.paymentMethod}`);
    }
  }

  if (context.recentIncomes.length > 0) {
    lines.push("");
    lines.push("=== RECENT INCOME (last 10) ===");
    for (const income of context.recentIncomes) {
      lines.push(`${income.date} | ${income.category} | ${income.source} | ₹${income.amount}`);
    }
  }

  return lines.join("\n");
}
