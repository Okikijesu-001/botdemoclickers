export default async function handler(req, res) {
  const { webhook, data } = req.body;

  if (!webhook) {
    return res.status(400).json({ error: "Invalid webhook URL" });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.text();
    res.status(response.status).send(result);
  } catch (err) {
    res.status(500).json({ error: "Relay error: " + err.message });
  }
}
