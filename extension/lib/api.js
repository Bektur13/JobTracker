// Runs in the popup context.
async function ctkSaveApplication(parsed, apiKey, apiBase) {
  const res = await fetch(`${apiBase}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      role: parsed.title,
      companyName: parsed.company,
      location: parsed.location ?? undefined,
      salaryRange: parsed.salaryRange ?? undefined,
      description: parsed.description ?? undefined,
      sourceUrl: parsed.sourceUrl,
      source: parsed.source,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  return res.json();
}
