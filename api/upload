// =====================================================
// 📁 api/upload.js
// Vercel Serverless Function – Bild-Upload zu Vercel Blob
// =====================================================
// Erwartet:
//   POST /api/upload?filename=foto.jpg
//   Body: raw binary (Content-Type: image/jpeg o.ä.)
//
// Liefert:
//   { url: "https://...blob.vercel-storage.com/..." }
// =====================================================

import { put } from "@vercel/blob";

// WICHTIG: Standard-BodyParser ausschalten, damit wir Binärdaten bekommen
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  // ---- CORS ----
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Nur POST erlaubt." } });
  }

  const filename = (req.query?.filename || "upload.jpg").toString();
  const contentType = req.headers["content-type"] || "application/octet-stream";

  // Nur Bilder erlauben (Sicherheit)
  if (!contentType.startsWith("image/")) {
    return res.status(400).json({ error: { message: "Nur Bild-Uploads erlaubt." } });
  }

  try {
    // Raw Body einlesen
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Max. 10 MB pro Bild
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: { message: "Datei zu groß (max. 10 MB)." } });
    }

    // Eindeutigen Pfad bauen (damit nichts überschrieben wird)
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `wunschmotive/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const blob = await put(path, buffer, {
      access: "public",
      contentType
    });

    return res.status(200).json({ url: blob.url });

  } catch (err) {
    return res.status(500).json({ error: { message: "Upload-Fehler: " + err.message } });
  }
}
