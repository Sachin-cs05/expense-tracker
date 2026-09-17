import { useEffect, useState } from "react";
import { Modal } from "../../ui/Modal.jsx";
import { Icon } from "../../ui/Icon.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition.js";

export function VoiceExpenseModal({ isOpen, onClose, onSaved, onOpenEditForm }) {
  const { showToast } = useToast();
  const { refreshCategories, refreshSpaces } = useAppData();
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    reset,
    setTranscript
  } = useVoiceRecognition();

  const [mode, setMode] = useState("listening"); // "listening" | "processing" | "clarification" | "confirmation" | "error"
  const [parsedExpenses, setParsedExpenses] = useState([]);
  const [clarification, setClarification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setMode("listening");
      setParsedExpenses([]);
      setClarification("");
      setErrorMessage("");
      setInputText("");
      return;
    }

    setMode("listening");
    if (isSupported) {
      startListening();
    }
  }, [isOpen, isSupported, startListening, reset]);

  // Keep manual inputText in sync with transcript
  useEffect(() => {
    const fullSpeech = (transcript + " " + interimTranscript).trim();
    if (fullSpeech) {
      setInputText(fullSpeech);
    }
  }, [transcript, interimTranscript]);

  // Sync speech errors to mode
  useEffect(() => {
    if (speechError) {
      setErrorMessage(speechError);
    }
  }, [speechError]);

  async function handleProcessTranscript(textToParse) {
    const text = (textToParse || inputText || transcript || "").trim();
    if (!text) {
      setErrorMessage("Please speak or enter an expense description.");
      return;
    }

    stopListening();
    setMode("processing");
    setErrorMessage("");

    try {
      const response = await api.parseVoiceExpense(text);

      if (response.clarificationNeeded && (!response.expenses || response.expenses.length === 0)) {
        setClarification(response.clarificationNeeded);
        setMode("clarification");
        return;
      }

      if (response.expenses && response.expenses.length > 0) {
        setParsedExpenses(response.expenses);
        setClarification(response.clarificationNeeded || "");
        setMode("confirmation");
      } else {
        setErrorMessage("Could not extract expense details. Please try saying it differently.");
        setMode("error");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to process voice entry. Please try again.");
      setMode("error");
    }
  }

  async function handleConfirmSave() {
    if (parsedExpenses.length === 0 || isSaving) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      for (const expense of parsedExpenses) {
        await api.createExpense({
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          paymentMethod: expense.paymentMethod || "Cash",
          spaceId: expense.spaceId || null,
          notes: "Logged via Voice Expense Entry"
        });
      }

      const count = parsedExpenses.length;
      showToast(count === 1 ? "✓ Expense added successfully!" : `✓ ${count} expenses added successfully!`);

      await Promise.all([refreshCategories(), refreshSpaces()]);
      onSaved?.();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to save expense. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditIndividual(expense) {
    onClose();
    onOpenEditForm?.(expense);
  }

  function handleTryAgain() {
    setMode("listening");
    setParsedExpenses([]);
    setErrorMessage("");
    setClarification("");
    setTranscript("");
    setInputText("");
    startListening();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopListening();
        onClose();
      }}
      title="Voice Expense Entry"
      subtitle="Add expenses naturally by speaking in English, Hindi, or Hinglish"
      width="520px"
    >
      <div className="voice-modal-content">
        {/* State 1: LISTENING State */}
        {mode === "listening" && (
          <div className="voice-state-listening">
            <div className={`voice-mic-circle ${isListening ? "pulse-active" : ""}`}>
              <Icon name="mic" size={36} />
              {isListening && (
                <div className="voice-waves">
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                  <span className="wave-bar" />
                </div>
              )}
            </div>

            <p className="voice-status-text">
              {isListening ? "Listening..." : "Click mic to start listening"}
            </p>

            <div className="voice-transcript-box">
              {inputText ? (
                <p className="voice-live-text">"{inputText}"</p>
              ) : (
                <p className="voice-placeholder-text">
                  Try saying: <em>"I spent 450 rupees on Swiggy today"</em> or <em>"Aaj Uber pe 200 aur Swiggy pe 350 kharch hue"</em>
                </p>
              )}
            </div>

            {errorMessage ? <p className="form-error mt-2">{errorMessage}</p> : null}

            <div className="voice-manual-fallback">
              <input
                type="text"
                placeholder="Or type voice command here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProcessTranscript(inputText)}
                className="ai-input-field"
              />
            </div>

            <div className="voice-modal-actions">
              {isListening ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => handleProcessTranscript(inputText)}
                  disabled={!inputText.trim()}
                >
                  Stop & Process Expense
                </button>
              ) : (
                <div className="voice-btn-group">
                  <button type="button" className="btn btn-secondary" onClick={startListening} disabled={!isSupported}>
                    <Icon name="mic" size={16} /> Start Mic
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleProcessTranscript(inputText)}
                    disabled={!inputText.trim()}
                  >
                    Process Expense
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* State 2: PROCESSING State */}
        {mode === "processing" && (
          <div className="voice-state-processing">
            <div className="voice-spinner-circle">
              <Icon name="sparkles" size={32} className="ai-spin-icon" />
            </div>
            <h3>Processing your expense...</h3>
            <p className="muted-copy">Analyzing speech with AI...</p>
            {inputText && <p className="voice-quote-text">"{inputText}"</p>}
          </div>
        )}

        {/* State 3: CLARIFICATION State */}
        {mode === "clarification" && (
          <div className="voice-state-clarification">
            <div className="voice-clarify-badge">
              <Icon name="info" size={24} />
            </div>
            <h3>Clarification Needed</h3>
            <p className="voice-clarify-question">{clarification || "Could you please specify the amount spent?"}</p>

            <div className="voice-manual-fallback my-3">
              <input
                type="text"
                placeholder="e.g. 500 rupees for dinner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProcessTranscript(inputText)}
                className="ai-input-field"
                autoFocus
              />
            </div>

            <div className="voice-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={handleTryAgain}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleProcessTranscript(inputText)}
                disabled={!inputText.trim()}
              >
                Submit Details
              </button>
            </div>
          </div>
        )}

        {/* State 4: CONFIRMATION State */}
        {mode === "confirmation" && (
          <div className="voice-state-confirmation">
            <div className="voice-success-header">
              <span className="voice-check-badge">✓</span>
              <div>
                <h3>{parsedExpenses.length > 1 ? `${parsedExpenses.length} Expenses Detected` : "Expense Detected"}</h3>
                <p className="muted-copy">Review the extracted details before saving</p>
              </div>
            </div>

            {clarification && (
              <div className="voice-clarify-banner">
                <Icon name="info" size={16} />
                <span>{clarification}</span>
              </div>
            )}

            <div className="voice-detected-list">
              {parsedExpenses.map((exp, idx) => (
                <div key={idx} className="voice-expense-card">
                  <div className="voice-expense-left">
                    <div className="voice-expense-icon">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div>
                      <h4 className="voice-expense-title">{exp.description}</h4>
                      <div className="voice-expense-tags">
                        <span className="category-pill">{exp.category}</span>
                        <span className="voice-date-tag">{exp.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="voice-expense-right">
                    <div className="voice-expense-amount">₹{exp.amount.toLocaleString()}</div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => handleEditIndividual(exp)}
                      title="Edit in full form"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <div className="voice-modal-actions mt-4">
              <button type="button" className="btn btn-ghost" onClick={handleTryAgain}>
                Try Again
              </button>
              {parsedExpenses.length === 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleEditIndividual(parsedExpenses[0])}
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : parsedExpenses.length > 1
                  ? `Confirm & Add All (${parsedExpenses.length})`
                  : "Confirm & Add Expense"}
              </button>
            </div>
          </div>
        )}

        {/* State 5: ERROR State */}
        {mode === "error" && (
          <div className="voice-state-error">
            <div className="voice-error-badge">
              <Icon name="alertTriangle" size={28} />
            </div>
            <h3>Unable to Parse Expense</h3>
            <p className="form-error my-2">{errorMessage || "Something went wrong."}</p>

            <div className="voice-modal-actions mt-4">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleTryAgain}>
                Try Again 🎤
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function getCategoryIcon(categoryName) {
  const cat = (categoryName || "").toLowerCase();
  if (cat.includes("food")) return "🍔";
  if (cat.includes("travel") || cat.includes("transport")) return "🚗";
  if (cat.includes("shop")) return "🛍️";
  if (cat.includes("bill")) return "💡";
  if (cat.includes("entertain")) return "🎬";
  if (cat.includes("health")) return "🏥";
  return "🏷️";
}
