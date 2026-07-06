/**
 * Wildcore Retreats — CMS backend (Cloudflare Worker)
 * ----------------------------------------------------
 * Single file, zero dependencies — paste this directly into the Cloudflare
 * dashboard's "Quick Edit" editor. No build step, no npm install needed.
 *
 * What it does:
 *  - POST /login    { username, password } -> { token }   (checks against secrets)
 *  - POST /publish   { token, content, images } -> commits the updated
 *    content-nl/en/es.json files and any replaced images straight to the
 *    GitHub repo behind this site, using the GitHub Contents API.
 *
 * Required Worker secrets/variables (Settings -> Variables and Secrets):
 *   ADMIN_USERNAME   e.g. 19252004
 *   ADMIN_PASSWORD   e.g. kain25
 *   SESSION_SECRET   any long random string (used to sign login sessions)
 *   GITHUB_TOKEN     a GitHub Personal Access Token with "Contents: read & write"
 *                    permission on the Wildcore-concept1 repo
 *   GITHUB_OWNER     your GitHub username
 *   GITHUB_REPO      Wildcore-concept1
 *   GITHUB_BRANCH    optional — leave unset to use the repo's default branch
 *
 * See "CMS-instructies-voor-Kain.md" for the full step-by-step deployment guide.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    try {
      if (url.pathname === "/login" && request.method === "POST") {
        return await handleLogin(request, env, cors);
      }
      if (url.pathname === "/publish" && request.method === "POST") {
        return await handlePublish(request, env, cors);
      }
      return jsonResponse({ error: "Onbekend endpoint." }, 404, cors);
    } catch (err) {
      return jsonResponse({ error: "Serverfout: " + err.message }, 500, cors);
    }
  },
};

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleLogin(request, env, cors) {
  const body = await safeJson(request);
  const username = body && body.username;
  const password = body && body.password;

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return jsonResponse(
      { error: "De Worker is nog niet volledig geconfigureerd (ontbrekende secrets)." },
      500,
      cors
    );
  }

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Onjuiste gebruikersnaam of wachtwoord." }, 401, cors);
  }

  const token = await createToken(env.SESSION_SECRET, 60 * 60 * 4); // geldig 4 uur
  return jsonResponse({ token }, 200, cors);
}

async function handlePublish(request, env, cors) {
  const body = await safeJson(request);
  const token = body && body.token;
  const content = body && body.content;
  const images = body && body.images;

  const valid = await verifyToken(token, env.SESSION_SECRET);
  if (!valid) {
    return jsonResponse({ error: "Sessie verlopen of ongeldig. Log opnieuw in." }, 401, cors);
  }

  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return jsonResponse(
      { error: "De Worker mist GitHub-configuratie (GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO)." },
      500,
      cors
    );
  }

  const updated = [];
  const failed = [];

  if (content && typeof content === "object") {
    for (const lang of ["nl", "en", "es"]) {
      if (!content[lang]) continue;
      const path = `content-${lang}.json`;
      const text = JSON.stringify(content[lang], null, 2) + "\n";
      try {
        await putGithubFile(env, path, toBase64Utf8(text), `Wildcore CMS: update ${path}`);
        updated.push(path);
      } catch (err) {
        failed.push(`${path}: ${err.message}`);
      }
    }
  }

  if (Array.isArray(images)) {
    for (const img of images) {
      if (!img || !img.path || !img.dataUrl) continue;
      const commaIndex = img.dataUrl.indexOf(",");
      const base64 = commaIndex >= 0 ? img.dataUrl.slice(commaIndex + 1) : img.dataUrl;
      try {
        await putGithubFile(env, img.path, base64, `Wildcore CMS: update ${img.path}`);
        updated.push(img.path);
      } catch (err) {
        failed.push(`${img.path}: ${err.message}`);
      }
    }
  }

  if (failed.length && !updated.length) {
    return jsonResponse({ error: "Publiceren is volledig mislukt.", details: failed }, 502, cors);
  }

  return jsonResponse({ ok: true, updated, failed }, 200, cors);
}

// ---------------------------------------------------------------------------
// GitHub Contents API helper
// ---------------------------------------------------------------------------

async function putGithubFile(env, path, base64Content, message) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH; // optional; omitted = repo default branch
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  const ghHeaders = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "User-Agent": "wildcore-cms-worker",
    Accept: "application/vnd.github+json",
  };

  // Look up the current file's sha (required by GitHub to update an existing file)
  let sha;
  const getUrl = branch ? `${apiUrl}?ref=${encodeURIComponent(branch)}` : apiUrl;
  const getRes = await fetch(getUrl, { headers: ghHeaders });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  } else if (getRes.status !== 404) {
    const errText = await getRes.text();
    throw new Error(`kon huidige versie niet ophalen (${getRes.status}): ${errText}`);
  }

  const putBody = {
    message,
    content: base64Content,
    ...(sha ? { sha } : {}),
    ...(branch ? { branch } : {}),
  };

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...ghHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub gaf fout ${putRes.status}: ${errText}`);
  }
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function jsonResponse(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ---- Signed session tokens (HMAC-SHA256 via native Web Crypto — no deps) ----

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64url(bytes) {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createToken(secret, expiresInSeconds) {
  const payload = JSON.stringify({ exp: Date.now() + expiresInSeconds * 1000 });
  const payloadB64 = base64url(new TextEncoder().encode(payload));
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${base64url(sig)}`;
}

async function verifyToken(token, secret) {
  if (!token || typeof token !== "string" || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await getHmacKey(secret);
    const validSig = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!validSig) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
