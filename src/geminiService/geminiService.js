// src/geminiService.js
import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent"; // Updated API URL



export const fetchGeminiResponse = async (userMessage) => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      

    const geminiReply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    console.log("Calling Gemini with key:", apiKey);
    console.log("User message:", userMessage);
  
    return geminiReply;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, there was an error connecting to Gemini.";
  }
};
