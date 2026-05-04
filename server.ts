import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Gemini API Proxy
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const response = await genAI.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: config?.systemInstruction,
          tools: config?.tools,
          toolConfig: config?.toolConfig,
          responseMimeType: config?.responseMimeType,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
