export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { bot_token, lists } = req.body;
    if (!bot_token || !Array.isArray(lists)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const baseUrl = `https://api.telegram.org/bot${bot_token}`;
    const MAX_BATCH = 100;
    const batch = lists.slice(0, MAX_BATCH);
    const results = [];

    // Helper function: retry once if Telegram returns failure
    async function tryTelegramRequest(url, retries = 1) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok) return { ok: true };
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 500)); // wait 0.5 sec
          return await tryTelegramRequest(url, retries - 1);
        }
        return { ok: false, error: data.description || "Unknown error" };
      } catch (e) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 500));
          return await tryTelegramRequest(url, retries - 1);
        }
        return { ok: false, error: e.message };
      }
    }

    // Process up to 100 in parallel (fast and efficient)
    await Promise.all(
      batch.map(async (item) => {
        try {
          let url = "";
          if (item.type === "delete") {
            if (!item.chat_id || !item.message_id)
              throw new Error("Missing chat_id or message_id for delete");
            url = `${baseUrl}/deleteMessage?chat_id=${item.chat_id}&message_id=${item.message_id}`;
          } 
          else if (item.type === "forward") {
            if (!item.from_chat_id || !item.to_chat_id || !item.message_id)
              throw new Error("Missing params for forward");
            url = `${baseUrl}/forwardMessage?chat_id=${item.to_chat_id}&from_chat_id=${item.from_chat_id}&message_id=${item.message_id}`;
          } 
          else {
            results.push({ id: item.id, success: false, error: "Invalid type" });
            return;
          }

          const result = await tryTelegramRequest(url, 1);

          results.push({
            id: item.id,
            type: item.type,
            success: result.ok,
            error: result.ok ? null : result.error
          });
        } catch (err) {
          results.push({ id: item.id, type: item.type, success: false, error: err.message });
        }
      })
    );

    // Return all results
    return res.status(200).json({
      ok: true,
      processed: results.length,
      results
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
