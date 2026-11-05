import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const answers = new Map<string, { expires: number; result: unknown }>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { query } = await req.json();
    const q = String(query ?? "").trim().slice(0, 500);
    if (!q) return json({ error: "Please describe what you need." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anonKey) return json({ error: "Catalog is not configured." }, 500);
    const sb = createClient(url, anonKey);
    const [{ data: products, error: productError }, { data: stores, error: storeError }] = await Promise.all([
      sb.from("products").select("*").eq("is_active", true).gt("stock", 0).order("id").limit(500),
      sb.from("stores").select("id,name").eq("is_active", true),
    ]);
    if (productError || storeError) return json({ error: "Unable to load the product catalog. Please try again." }, 503);
    const cacheKey = JSON.stringify([q.toLowerCase(), products, stores]);
    const cached = answers.get(cacheKey);
    if (cached && cached.expires > Date.now()) return json(cached.result);
    const storeName = new Map((stores ?? []).map((s: any) => [s.id, s.name]));
    const catalog = (products ?? [])
      .map((p: any) => `${p.id}|${p.name}|${p.category}|${p.price} FRw/${p.unit ?? "piece"}|${storeName.get(p.store_id) ?? "WellarShop"}`)
      .join("\n");

    const prompt = `You are a shopping assistant for WellarShop (Rwanda, prices in FRw). Catalog lines: id|name|category|price|store.
${catalog}

Shopper request: "${q}"

Pick up to 8 best matching products from the catalog only. Be concise: one short summary and reasons of 3–6 words. Reply with ONLY JSON: {"summary": "short friendly sentence", "items":[{"id":"<id>","reason":"short reason"}]}. If nothing matches, return empty items and say so in summary.`;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text();
      let msg = "AI request failed.";
      if (upstream.status === 429) msg = "Too many requests, please try again shortly.";
      else if (upstream.status === 402) msg = "AI credits are used up for this workspace.";
      else { try { msg = JSON.parse(t)?.error?.message || JSON.parse(t)?.message || msg; } catch { /* */ } }
      return json({ error: msg }, upstream.status);
    }

    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta") text += ev.delta;
        } catch { /* */ }
      }
    }
    const m = text.match(/\{[\s\S]*\}/);
    let parsed: any = { summary: text || "No suggestions.", items: [] };
    try { if (m) parsed = JSON.parse(m[0]); } catch { /* */ }
    const valid = new Set((products ?? []).map((p: any) => p.id));
    parsed.items = (Array.isArray(parsed.items) ? parsed.items : []).filter((i: any) => valid.has(i?.id)).slice(0, 8);
    parsed.products = parsed.items.map((i: any) => products?.find((p: any) => p.id === i.id)).filter(Boolean);
    for (const [key, entry] of answers) if (entry.expires <= Date.now()) answers.delete(key);
    if (answers.size >= 50) { const oldest = answers.keys().next().value; if (oldest) answers.delete(oldest); }
    if (m && parsed.items.length) answers.set(cacheKey, { expires: Date.now() + 60_000, result: parsed });
    return json(parsed);
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
