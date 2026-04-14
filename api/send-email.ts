import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { customerEmail, customerName, businessName, city, phone, items } = req.body;

  const itemsHtml = (items || []).map((item: any) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.color || "-"}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.boxes || 0}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.pieces || 0}</td></tr>`
  ).join("") || "<tr><td colspan='4'>Nuk ka produkte</td></tr>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "EGJEU <noreply@egjeu.al>",
      to: ["topciuergest@gmail.com"],
      subject: `Kërkesë për Ofertë - ${customerName || ""}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#163058;padding:20px;text-align:center"><h1 style="color:white;margin:0">EGJEU</h1></div><div style="padding:30px"><h2 style="color:#163058">Kërkesë e re për Ofertë</h2><p><b>Emri:</b> ${customerName || "-"}</p><p><b>Biznesi:</b> ${businessName || "-"}</p><p><b>Email:</b> ${customerEmail || "-"}</p><p><b>Telefon:</b> ${phone || "-"}</p><p><b>Qyteti:</b> ${city || "-"}</p><h3 style="color:#163058">Produktet:</h3><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Produkti</th><th style="padding:8px;text-align:left">Ngjyra</th><th style="padding:8px;text-align:left">Kutitë</th><th style="padding:8px;text-align:left">Copë</th></tr></thead><tbody>${itemsHtml}</tbody></table></div><div style="background:#f5f5f5;padding:15px;text-align:center;color:#999;font-size:12px">EGJEU Hotel Collection — hotel.egjeu.al</div></div>`,
    }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
