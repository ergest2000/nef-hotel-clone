const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email mungon" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "EGJEU <noreply@egjeu.al>",
        to: [email],
        subject: `Mirë se erdhët në Egjeu!`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:#163058;padding:20px;text-align:center"><h1 style="color:white;margin:0">EGJEU</h1></div>
          <div style="padding:30px;color:#333;line-height:1.6">
            <h2 style="color:#163058">Përshëndetje dhe mirë se erdhët!</h2>
            <p>Faleminderit që u regjistruat në newsletter-in tonë.</p>
            <p>Në vijim do të njoftoheni për koleksionet më të reja të tekstileve, produktet për hoteleri dhe ofertat e dedikuara për hotele, apo struktura të tjera akomoduese.</p>
            <p>Nëse keni pyetje ose kërkesa specifike, ekipi ynë është gjithmonë në dispozicionin tuaj për t'ju asistuar.</p>
            <p>Faleminderit!</p>
            <p style="margin-top:24px"><b>Ekipi Egjeu</b></p>
          </div>
          <div style="background:#f5f5f5;padding:15px;text-align:center;color:#999;font-size:12px">EGJEU Hotel Collection — hotel.egjeu.al</div>
        </div>`,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
