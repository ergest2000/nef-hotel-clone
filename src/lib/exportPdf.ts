export const exportToPDF = (title: string, records: { label: string; value: string }[][]) => {
  const rows = records.map((fields, i) => {
    const fieldsHtml = fields
      .filter((f) => f.value)
      .map((f) => `<div style="margin-bottom:6px"><span style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px">${f.label}</span><br/><span style="font-size:13px;color:#222;white-space:pre-line">${f.value}</span></div>`)
      .join("");
    return `<div style="border:1px solid #ddd;border-radius:6px;padding:16px;margin-bottom:12px;page-break-inside:avoid"><div style="font-size:11px;color:#aaa;margin-bottom:8px">Rekord ${i + 1}</div>${fieldsHtml}</div>`;
  }).join("");

  const html = `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #222; }
        h1 { font-size: 20px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; color: #1a4a6e; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #999; margin-bottom: 30px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="subtitle">Gjeneruar: ${new Date().toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
      ${rows}
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
};
