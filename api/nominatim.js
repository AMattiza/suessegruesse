// =====================================================
// 📁 api/nominatim.js
// Vercel Serverless Function – Nominatim Proxy
// =====================================================
// DEPLOYMENT:
//   1. Diese Datei unter /api/nominatim.js im Vercel-Repo ablegen.
//   2. Optional: NOMINATIM_USER_AGENT als Env-Var in Vercel setzen
//      (z.B. "sweet-greet/1.0 (kontakt@sweet-greet.com)").
//      Default ist "sweet-greet-formular/1.0".
//
// USAGE (vom Frontend):
//   GET /api/nominatim?q=Eisenstatue+Torgelow&limit=5
//
// HINWEIS:
//   - Nominatim erlaubt max. 1 Request/Sekunde.
//   - Der Proxy fügt automatisch den korrekten User-Agent hinzu.
//   - Antwort-Format: Array von Treffern mit
//     { display_name, lat, lon, type, class, address: {...} }
// =====================================================

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const { q, limit = "5", countrycodes = "de,at,ch" } = req.query || {};
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: { message: "Missing query 'q'" } });
  }

  const params = new URLSearchParams({
    q: String(q).trim(),
    format: "jsonv2",
    addressdetails: "1",
    limit: String(Math.min(parseInt(limit) || 5, 10)),
    countrycodes: String(countrycodes),
    "accept-language": "de"
  });

  const url = `${NOMINATIM_BASE}?${params.toString()}`;
  const userAgent = process.env.NOMINATIM_USER_AGENT || "sweet-greet-formular/1.0";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: { message: `Nominatim HTTP ${response.status}: ${text.slice(0, 200)}` }
      });
    }

    const data = await response.json();

    // Nur die für das Formular relevanten Felder zurückgeben
    const slim = (Array.isArray(data) ? data : []).map(r => ({
      display_name: r.display_name,
      name: r.name || r.namedetails?.name || r.address?.tourism || r.address?.amenity || "",
      type: r.type,
      class: r.class,
      latitude: r.lat ? parseFloat(r.lat) : null,
      longitude: r.lon ? parseFloat(r.lon) : null,
      osm_id: r.osm_id,
      osm_type: r.osm_type,
      address: r.address || {}
    }));

    // Cache für 24h, damit mehrfache Suchen nicht jedes Mal abrufen
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).json({ results: slim });
  } catch (err) {
    return res.status(500).json({
      error: { message: `Proxy error: ${err.message || err}` }
    });
  }
}
