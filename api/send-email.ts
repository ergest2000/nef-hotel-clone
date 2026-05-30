export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  // Lexim i sigurt i trupit (string ose objekt)
  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Logo nga link publik (Gmail i bllokon imazhet base64)
  const LOGO = "https://hotel.egjeu.al/egjeu-logo.png";

  // ===== NEWSLETTER: welcome email te abonuesi =====
  if (body.type === "newsletter") {
    const email = body.email;
    if (!email) return res.status(400).json({ error: "Email mungon" });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EGJEU <noreply@egjeu.al>",
        to: [email],
        subject: `Mirë se erdhët në Egjeu!`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#163058;padding:20px;text-align:center"><img src="${LOGO}" alt="EGJEU" style="height:50px;max-width:200px;object-fit:contain" /></div><div style="padding:30px;color:#333;line-height:1.6"><h2 style="color:#163058">Përshëndetje dhe mirë se erdhët!</h2><p>Faleminderit që u regjistruat në newsletter-in tonë.</p><p>Në vijim do të njoftoheni për koleksionet më të reja të tekstileve, produktet për hoteleri dhe ofertat e dedikuara për hotele, apo struktura të tjera akomoduese.</p><p>Nëse keni pyetje ose kërkesa specifike, ekipi ynë është gjithmonë në dispozicionin tuaj për t'ju asistuar.</p><p>Faleminderit!</p><p style="margin-top:24px"><b>Ekipi Egjeu</b></p></div><div style="background:#f5f5f5;padding:15px;text-align:center;color:#999;font-size:12px">EGJEU Hotel Collection — hotel.egjeu.al</div></div>`,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  }

  // ===== OFERTA: njoftim te admini =====
  const { customerEmail, customerName, businessName, city, phone, items } = body;

  const itemsHtml = (items || []).map((item: any) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.color||"-"}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.boxes||0}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.pieces||0}</td></tr>`
  ).join("") || "<tr><td colspan='4'>Nuk ka produkte</td></tr>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "EGJEU <noreply@egjeu.al>",
      to: ["topciuergest@gmail.com", "info@rejs.al"],
      subject: `Kërkesë për Ofertë`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#163058;padding:20px;text-align:center"><img src="${LOGO}" alt="EGJEU" style="height:50px;max-width:200px;object-fit:contain" /></div><div style="padding:30px"><h2 style="color:#163058">Kërkesë e re për Ofertë</h2><p><b>Emri:</b> ${customerName||"-"}</p><p><b>Biznesi:</b> ${businessName||"-"}</p><p><b>Email:</b> ${customerEmail||"-"}</p><p><b>Telefon:</b> ${phone||"-"}</p><p><b>Qyteti:</b> ${city||"-"}</p><h3 style="color:#163058">Produktet:</h3><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Produkti</th><th style="padding:8px;text-align:left">Ngjyra</th><th style="padding:8px;text-align:left">Kutitë</th><th style="padding:8px;text-align:left">Copë</th></tr></thead><tbody>${itemsHtml}</tbody></table></div><div style="background:#f5f5f5;padding:15px;text-align:center;color:#999;font-size:12px">EGJEU Hotel Collection — hotel.egjeu.al</div></div>`,
    }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
