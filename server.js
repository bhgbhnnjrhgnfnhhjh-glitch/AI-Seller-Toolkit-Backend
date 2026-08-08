require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
    res.send("✅ AI Seller Toolkit Gemini Backend is running!");
});

app.post("/generate", async (req, res) => {

    try {

        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        res.json({
            result: response.text
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        res.status(500).json({
            error: "Gemini API request failed"
        });
    }

});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
