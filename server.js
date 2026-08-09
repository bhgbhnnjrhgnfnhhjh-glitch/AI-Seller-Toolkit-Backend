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


/* =========================
   HOME / HEALTH CHECK
========================= */

app.get("/", (req, res) => {

    res.json({
        status: "success",
        message: "✅ AI Seller Toolkit Gemini Backend is running!"
    });

});


/* =========================
   GEMINI GENERATION
========================= */

async function generateWithRetry(prompt) {

    const models = [
        "gemini-3.5-flash",
        "gemini-3.6-flash"
    ];

    let lastError = null;

    for (const model of models) {

        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                console.log(
                    `🤖 Trying ${model} - Attempt ${attempt}`
                );

                const response =
                    await ai.models.generateContent({

                        model: model,
                        contents: prompt

                    });

                const text = response.text;

                if (!text || !text.trim()) {

                    throw new Error(
                        "Gemini returned an empty response"
                    );

                }

                console.log(
                    `✅ Gemini response received from ${model}`
                );

                return text;

            } catch (error) {

                lastError = error;

                console.error(
                    `❌ ${model} attempt ${attempt} failed:`,
                    error.message || error
                );

                const status =
                    error?.status ||
                    error?.code ||
                    error?.error?.code;

                const message =
                    error?.message ||
                    error?.error?.message ||
                    "";

                const temporaryError =
                    status === 429 ||
                    status === 500 ||
                    status === 502 ||
                    status === 503 ||
                    message.includes("high demand") ||
                    message.includes("temporarily");

                if (!temporaryError) {

                    break;

                }

                if (attempt < 3) {

                    const delay =
                        Math.pow(2, attempt) * 1000;

                    console.log(
                        `⏳ Retrying after ${delay}ms...`
                    );

                    await new Promise(
                        resolve => setTimeout(resolve, delay)
                    );

                }

            }

        }

        console.log(
            `⚠️ Switching model after failures: ${model}`
        );

    }

    throw lastError ||
        new Error("Gemini API request failed");

}


/* =========================
   GENERATE ENDPOINT
========================= */

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

                error:
                    "GEMINI_API_KEY is not configured on Render"

            });

        }


        console.log("📥 Gemini request received");


        const result =
            await generateWithRetry(prompt);


        console.log("✅ Listing generated successfully");


        return res.json({

            result: result

        });


    } catch (error) {

        console.error(
            "❌ Final Gemini Error:",
            error
        );


        const status =
            error?.status ||
            error?.code ||
            error?.error?.code ||
            500;


        const details =
            error?.message ||
            error?.error?.message ||
            "Unknown Gemini API error";


        if (
            status === 429 ||
            status === 503 ||
            details.includes("high demand")
        ) {

            return res.status(503).json({

                error:
                    "Gemini service is temporarily busy. Please try again in a few seconds."

            });

        }


        return res.status(500).json({

            error:
                "Gemini API request failed",

            details:
                details

        });

    }

});


/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on port ${PORT}`
    );

});
