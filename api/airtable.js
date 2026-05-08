// =====================================================
// 📁 api/airtable.js
// Vercel Serverless Function – Airtable Proxy (v2)
// =====================================================
// DEPLOYMENT:
//   1. Diese Datei in dein Vercel/GitHub-Repo unter /api/airtable.js legen
//   2. In Vercel → Project Settings → Environment Variables:
//        AIRTABLE_TOKEN = patSqjAZcXOa7MslA....
//        AIRTABLE_BASE  = appZrJBVXNrTrcp7c
//        ALLOWED_ORIGIN = https://www.suesse-gruesse.online
//   3. Im Frontend:
//        PROXY_URL = "https://DEIN-PROJEKT.vercel.app/api/airtable"
// =====================================================
//
// REQUEST-SCHEMA (vom Frontend):
//   GET    /api/airtable?table=Firmen&filter=...
//   GET    /api/airtable?table=Firmen&recordId=recXXX
//   GET    /api/airtable?table=Firmen&pageSize=100&offset=xyz    ← NEU
//   POST   /api/airtable?table=Firmen   Body: { fields: {...} }
//   PATCH  /api/airtable?table=Firmen&recordId=recXXX  Body: { fields: {...} }
// =====================================================

export default async function handler(req, res) {
  // ---- CORS ----
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  // ---- ENV-Check ----
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE  = process.env.AIRTABLE_BASE;
  if (!TOKEN || !BASE) {
    return res.status(500).json({ error: { message: "Server-Konfiguration unvollständig (AIRTABLE_TOKEN/BASE fehlen)." } });
  }

  // ---- Parameter ----
  const { table, filter, recordId, ...rest } = req.query || {};
  if (!table) return res.status(400).json({ error: { message: "Parameter 'table' fehlt." } });

  // ---- Whitelist ----
  const ALLOWED_TABLES = [
    // Bestehendes Formular
    "Firmen",
    "Objekttypen",
    "Städte",
    "User",
    // Neues Auftragsformular
    "Projects",
    "Illustrationen (AI)",
    "Kontakte",
    "Freigaben",
    "Postkarten",
    "tblPnRnrtVmOd7KnD",  // Vertriebsmitarbeiter
    "tblyZxDd39OKqThP5"   // Postkartenedition
  ];
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(403).json({ error: { message: `Tabelle '${table}' ist nicht freigegeben.` } });
  }

  // ---- Erlaubte Airtable-Query-Params durchreichen ----
  // (zusätzlich zu filter/recordId – wichtig z.B. für Paginierung mit offset)
  const PASSTHROUGH_PARAMS = [
    "pageSize",        // Anzahl pro Seite
    "offset",          // Paginierungs-Offset
    "view",            // spezifische View
    "sort",            // Sortierung (selten)
    "fields",          // nur bestimmte Felder (Performance)
    "maxRecords",      // Hard-Limit
    "cellFormat",
    "timeZone",
    "userLocale",
    "returnFieldsByFieldId"
  ];

  const params = new URLSearchParams();
  if (filter) params.append("filterByFormula", filter);
  for (const key of PASSTHROUGH_PARAMS) {
    if (rest[key] !== undefined) {
      const val = rest[key];
      // Array-Werte (z.B. sort[0][field]=...) ggf. korrekt behandeln
      if (Array.isArray(val)) {
        val.forEach(v => params.append(key, v));
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
        "Content-Type": "application/json"
      }
    };
    if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) {
      opts.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }
    const r = await fetch(airtableUrl, opts);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy-Fehler: " + err.message } });
  }
}
