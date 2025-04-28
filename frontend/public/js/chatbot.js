import { GoogleGenerativeAI } from "@google/generative-ai";

// Load training data
async function loadTrainingData() {
  try {
    const response = await fetch("../../../backend/data/training-data.json");
    if (!response.ok) throw new Error("Failed to fetch training data");
    return await response.json();
  } catch (error) {
    console.error("Training Data Error:", error);
    return [];
  }
}

// Initialize AI model
const API_KEY = GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

let messages = { history: [] };

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded.");

  // Select elements
  const typingIndicator = document.querySelector(".typing-indicator");
  const chatWindow = document.querySelector(".chat-window");
  const sendButton = document.querySelector(".input-area button");
  const userInput = document.querySelector(".input-area input");
  const chatArea = document.querySelector(".chat-window .chat");
  const closeButton = document.querySelector(".close");

  if (!chatWindow || !sendButton || !userInput || !chatArea) {
    console.error("One or more necessary elements are missing.");
    return;
  }

  // Drag Chat Window
  let isDragging = false,
    offsetX,
    offsetY;

  chatWindow.addEventListener("mousedown", (e) => {
    if (e.target.closest(".input-area")) return;
    isDragging = true;
    offsetX = e.clientX - chatWindow.offsetLeft;
    offsetY = e.clientY - chatWindow.offsetTop;
    chatWindow.style.position = "absolute";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    chatWindow.style.left = `${e.clientX - offsetX}px`;
    chatWindow.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => (isDragging = false));

  // Close Chat Window
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      chatWindow.style.display = "none";
    });
  }

  // Function to send message
  async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    console.log("Send button clicked!");

    // Clear input field
    userInput.value = "";

    // Add user message with avatar
    chatArea.insertAdjacentHTML(
      "beforeend",
      `<div class="user">
        <p>${userMessage}</p>
      </div>`
    );

    // Show typing indicator
    if (typingIndicator) typingIndicator.style.display = "block";

    try {
      const trainingData = await loadTrainingData();
      let aiResponse = findTrainingResponse(userMessage, trainingData);

      if (!aiResponse) {
        const chat = model.startChat({ history: messages.history });
        const result = await chat.sendMessage(userMessage);
        aiResponse =
          result.response?.text() || "I'm sorry, I couldn't understand that.";
      }

      // Hide typing indicator
      if (typingIndicator) typingIndicator.style.display = "none";

      // Add AI response with avatar
      chatArea.insertAdjacentHTML(
        "beforeend",
        `<div class="model">
          <p>${aiResponse}</p>
        </div>`
      );

      messages.history.push({ role: "user", parts: [{ text: userMessage }] });
      messages.history.push({ role: "model", parts: [{ text: aiResponse }] });

      // Auto-scroll to latest message
      chatArea.scrollTop = chatArea.scrollHeight;
    } catch (error) {
      console.error("Chat API Error:", error);
      chatArea.insertAdjacentHTML(
        "beforeend",
        `<div class="error"><p>Message failed. Please try again.</p></div>`
      );
      if (typingIndicator) typingIndicator.style.display = "none";
    }
  }

  // Attach event listeners for sending messages
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});

// Function to match training responses
function findTrainingResponse(userMessage, trainingData) {
  return (
    trainingData.find((item) =>
      userMessage.toLowerCase().includes(item.input?.toLowerCase())
    )?.output || null
  );
}

