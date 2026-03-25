/**
 * Vercel Serverless: POST /api/submit
 * Body: { "email": "a@b.com", "_gotcha": "" }
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (Vercel dashboard → Settings → Env)
 * Optional: SUPABASE_TABLE (default waitlist_submissions)
 *
 * Service role stays server-only — never put it in the browser or form-config.js.
 */

function readJsonStream(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on("data", function (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", function () {
      try {
        var raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_TABLE || "waitlist_submissions";

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Server not configured" });
  }

  var body = req.body;
  if (body === undefined) {
    try {
      body = await readJsonStream(req);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  } else if (body == null || typeof body === "string") {
    try {
      body = typeof body === "string" && body.trim() ? JSON.parse(body) : {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (typeof body !== "object" || body === null) {
    body = {};
  }

  if (body._gotcha && String(body._gotcha).trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const base = supabaseUrl.replace(/\/$/, "");
  const insertUrl = `${base}/rest/v1/${table}`;

  const r = await fetch(insertUrl, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email }),
  });

  if (r.ok || r.status === 201) {
    return res.status(200).json({ ok: true });
  }

  const text = await r.text();
  if (
    r.status === 409 ||
    /duplicate|unique/i.test(text)
  ) {
    return res.status(200).json({ ok: true, duplicate: true });
  }

  console.error("[api/submit]", r.status, text.slice(0, 500));
  return res.status(500).json({ error: "Failed to save" });
};
