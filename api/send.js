// /api/send.js
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

    const text = await response.text();
    // Forward the webhook response (status + text) back to caller
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: "Relay error: " + err.message });
  }
}
