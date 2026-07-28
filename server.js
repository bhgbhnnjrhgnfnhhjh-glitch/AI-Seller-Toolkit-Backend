require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: prompt
    });

    res.json({
      result: response.output_text
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
