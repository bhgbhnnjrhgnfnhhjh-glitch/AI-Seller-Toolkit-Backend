require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing!");
}

const ai = new GoogleGenAI({
    apiKey: API_KEY
});


app.get("/", (req, res) => {

    res.json({
        status: "success",
        message: "✅ AI Seller Toolkit Gemini Backend is running!"
    });

});


app.post("/generate", async (req, res) => {

    try {

        const prompt = req.body.prompt;

        if (!prompt) {

            return res.status(400).json({
                error: "Prompt is required"
            });

        }


        if (!API_KEY) {

            return res.status(500).json({
                error: "GEMINI_API_KEY is not configured on server"
            });

        }


        console.log("🤖 Gemini request received");


        const response = await ai.models.generateContent({

            model: "gemini-3.6-flash",

            contents: prompt

        });


        const result = response.text;


        if (!result) {

            console.error("❌ Gemini returned empty response");

            return res.status(500).json({
                error: "Gemini returned an empty response"
            });

        }


        console.log("✅ Gemini response generated");


        res.json({
            result: result
        });


    } catch (error) {

        console.error("❌ Gemini API Error:");
        console.error(error);


        const errorMessage =
            error?.message ||
            error?.toString() ||
            "Unknown Gemini API error";


        res.status(500).json({

            error: "Gemini API request failed",

            details: errorMessage

        });

    }

});


app.listen(PORT, () => {

    console.log(
        `🚀 Server running on port ${PORT}`
    );

});
