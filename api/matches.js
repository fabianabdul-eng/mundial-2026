// Vercel serverless function: proxy a football-data.org
// La API key vive solo en el servidor — el navegador nunca la ve.
export default async function handler(req, res) {
  const TOKEN = process.env.FD_TOKEN || "1066e04223514d72b23785d07131f7a8";
  try {
    const upstream = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": TOKEN } }
    );
    if (!upstream.ok) {
      const body = await upstream.text();
      return res
        .status(upstream.status)
        .json({ error: "upstream", status: upstream.status, body });
    }
    const data = await upstream.json();
    // Cache CDN ~30s para respetar rate limit y dar respuesta instantanea
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "proxy", message: String((err && err.message) || err) });
  }
}
