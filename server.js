const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API_KEY;

/* -------------------------------------------------- */
/* 🔹 ROOT ROUTE                                     */
/* -------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Exam-Mate Backend is Running Successfully ✅");
});

/* -------------------------------------------------- */
/* 🔹 TEST ROUTE                                     */
/* -------------------------------------------------- */
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working properly ✅" });
});

/* -------------------------------------------------- */
/* 🔹 PROMPT BUILDER                                 */
/* -------------------------------------------------- */
function buildPrompt(subject, topic, mode) {
  return `
You are a B.Tech university exam assistant.

Subject: ${subject}
Topic: ${topic}
Mode: ${mode}

Generate a proper academic answer suitable for university exams.
Use structured headings, bullet points, and clear explanations.
Make it exam-ready and well formatted.
`;
}

/* -------------------------------------------------- */
/* 🔹 MAIN AI ROUTE                                  */
/* -------------------------------------------------- */
app.post("/api/generate", async (req, res) => {
  try {
    const { subject, topic, mode } = req.body;

    if (!subject || !topic || !mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = buildPrompt(subject, topic, mode);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Full Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    res.json({ answer });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -------------------------------------------------- */
/* 🔹 START SERVER                                   */
/* -------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});