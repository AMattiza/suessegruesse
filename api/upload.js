// =====================================================
// 📁 api/upload.js
// Vercel Serverless Function – Datei-Upload zu Vercel Blob
// =====================================================
// Erwartet:
//   POST /api/upload?filename=foto.jpg
//   Body: raw binary (Content-Type: image/jpeg, application/pdf, ...)
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

// Erlaubte MIME-Types (Bilder + PDF + Office-Docs)
const ALLOWED_MIME_TYPES = [
  // Bilder
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  // Dokumente
  "application/pdf",
  // Office (für Step-4 Allgemeine Dateien)
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

// Max. 15 MB pro Datei
const MAX_FILE_SIZE = 15 * 1024 * 1024;

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

  const filename = (req.query?.filename || "upload.bin").toString();
  const contentType = (req.headers["content-type"] || "application/octet-stream").toLowerCase();

  // MIME-Type-Whitelist prüfen (mit Fallback auf Endung bei generischen Types)
  const isAllowedByMime = ALLOWED_MIME_TYPES.some(t => contentType.startsWith(t));
  const ext = (filename.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "pdf", "doc", "docx", "xls", "xlsx"];
  const isAllowedByExt = allowedExtensions.includes(ext);

  if (!isAllowedByMime && !isAllowedByExt) {
    return res.status(400).json({
      error: {
        message: `Dateityp nicht erlaubt: ${contentType} (${filename}). Erlaubt: Bilder, PDF, DOC/DOCX, XLS/XLSX.`
      }
    });
  }

  try {
    // Raw Body einlesen
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: { message: `Datei zu groß (${(buffer.length / 1024 / 1024).toFixed(1)} MB, max. ${MAX_FILE_SIZE / 1024 / 1024} MB).` }
      });
    }

    // Eindeutigen Pfad bauen (damit nichts überschrieben wird)
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Pfad-Prefix nach Datei-Typ (rein zur Übersicht im Blob-Storage)
    const folder = ["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)
      ? "documents"
      : "wunschmotive";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    // Wenn Content-Type generisch ist, aus Endung ableiten
    let finalContentType = contentType;
    if (contentType === "application/octet-stream" || !isAllowedByMime) {
      const extToMime = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        heic: "image/heic",
        heif: "image/heif",
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      };
      if (extToMime[ext]) finalContentType = extToMime[ext];
    }

    const blob = await put(path, buffer, {
      access: "public",
      contentType: finalContentType
    });

    return res.status(200).json({ url: blob.url });

  } catch (err) {
    return res.status(500).json({ error: { message: "Upload-Fehler: " + err.message } });
  }
}
