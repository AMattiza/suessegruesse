// =====================================================
// 📁 api/airtable.js
// Vercel Serverless Function – Airtable Proxy (v3)
// =====================================================
// DEPLOYMENT:
//   1. Diese Datei in dein Vercel/GitHub-Repo unter /api/airtable.js legen
//   2. In Vercel → Project Settings → Environment Variables:
//        AIRTABLE_TOKEN = patSqjAZcXOa7MslA....
//        AIRTABLE_BASE  = appZrJBVXNrTrcp7c
//        ALLOWED_ORIGIN = https://www.suesse-gruesse.online,https://sg-hero.vercel.app,https://www.sweet-greet.com
//        (mehrere Origins komma-separiert, ohne Leerzeichen oder mit — beides erlaubt)
//   3. Im Frontend:
//        PROXY_URL = "https://DEIN-PROJEKT.vercel.app/api/airtable"
// =====================================================
//
// REQUEST-SCHEMA (vom Frontend):
//   GET    /api/airtable?table=Firmen&filter=...
//   GET    /api/airtable?table=Firmen&recordId=recXXX
//   GET    /api/airtable?table=Firmen&pageSize=100&offset=xyz
//   POST   /api/airtable?table=Firmen   Body: { fields: {...} }
//   PATCH  /api/airtable?table=Firmen&recordId=recXXX  Body: { fields: {...} }
// =====================================================

export default async function handler(req, res) {
  // ---- CORS (Multi-Origin) ----
  // ALLOWED_ORIGIN kann mehrere Origins komma-separiert enthalten.
  // Wir prüfen den Request-Origin gegen die Liste und spiegeln ihn
  // zurück, wenn er erlaubt ist. So funktioniert CORS für mehrere
  // Domains (z.B. sweet-greet.com + sg-hero.vercel.app).
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const reqOrigin = req.headers.origin;
  let allowOriginHeader;
  if (allowedOrigins.length === 1 && allowedOrigins[0] === "*") {
    allowOriginHeader = "*";
  } else if (reqOrigin && allowedOrigins.includes(reqOrigin)) {
    allowOriginHeader = reqOrigin;
  } else {
    // Fallback: erste konfigurierte Origin — verhindert CORS-Fehler beim
    // direkten Aufruf ohne Origin-Header (z.B. curl, Postman).
    allowOriginHeader = allowedOrigins[0] || "*";
  }
  res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  // ---- ENV-Check ----
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE = process.env.AIRTABLE_BASE;
  if (!TOKEN || !BASE) {
    return res.status(500).json({
      error: {
        message:
          "Server-Konfiguration unvollständig (AIRTABLE_TOKEN/BASE fehlen).",
      },
    });
  }

  // ---- Parameter ----
  const { table, filter, recordId, ...rest } = req.query || {};
  if (!table)
    return res
      .status(400)
      .json({ error: { message: "Parameter 'table' fehlt." } });

  // ---- Whitelist ----
  const ALLOWED_TABLES = [
    // Bestehendes Formular
    "Firmen",
    "Objekttypen",
    "Städte",
    "User",
    // Auftragsformular
    "Projects",
    "Illustrationen (AI)",
    "Kontakte",
    "Freigaben",
    "Postkarten",
    "tblPnRnrtVmOd7KnD", // Vertriebsmitarbeiter
    "tblyZxDd39OKqThP5", // Postkartenedition
    // sg-hero Formulare
    "Angebotsanfragen",
    "Rückrufanfragen",
  ];
  if (!ALLOWED_TABLES.includes(table)) {
    return res
      .status(403)
      .json({ error: { message: `Tabelle '${table}' ist nicht freigegeben.` } });
  }

  // ---- Erlaubte Airtable-Query-Params durchreichen ----
  const PASSTHROUGH_PARAMS = [
    "pageSize",
    "offset",
    "view",
    "sort",
    "fields",
    "maxRecords",
    "cellFormat",
    "timeZone",
    "userLocale",
    "returnFieldsByFieldId",
  ];

  const params = new URLSearchParams();
  if (filter) params.append("filterByFormula", filter);
  for (const key of PASSTHROUGH_PARAMS) {
    if (rest[key] !== undefined) {
      const val = rest[key];
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else {
        params.append(key, val);
      }
    }
  }

  // ---- Airtable-URL bauen ----
  let airtableUrl = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`;
  if (recordId) airtableUrl += `/${encodeURIComponent(recordId)}`;
  const qs = params.toString();
  if (qs) airtableUrl += `?${qs}`;

  // ---- Forward ----
  try {
    const opts = {
      method: req.method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) {
      opts.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }
    const r = await fetch(airtableUrl, opts);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: { message: "Proxy-Fehler: " + err.message } });
  }
}
