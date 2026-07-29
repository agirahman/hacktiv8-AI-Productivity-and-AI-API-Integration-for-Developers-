import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype }}
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
})

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { text: prompt ?? "tolong buat ringkasan dari dokumen ini", type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype }}
            ]
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
})

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                { text: prompt ?? "tolong buat transkrip dari rekaman berikut", type: "text" },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype }}
            ]
        });
        
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
})

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});
