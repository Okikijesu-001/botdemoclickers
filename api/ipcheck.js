// /api/ipcheck.js
export default async function handler(req, res) {
  const ip = req.query.ip;
  if (!ip) return res.status(400).json({ success: false, error: "No IP provided" });

  // Add your API keys here:
  const API_KEYS = [
    "YOUR_API_KEY_1",
    "YOUR_API_KEY_2",
    "YOUR_API_KEY_3"
  ];

  const buildUrl = (key, ipAddr) =>
    `https://api.isproxyip.com/v1/check.php?key=${encodeURIComponent(key)}&ip=${encodeURIComponent(ipAddr)}&format=json`;

  let lastError = null;

  for (const key of API_KEYS) {
    try {
      const url = buildUrl(key, ip);
      const response = await fetch(url /* remove timeout option if your runtime doesn't support it */);

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();

      // If API returned an error, try next key
      if (data.status === "error") {
        lastError = new Error(data.message || "Unknown API error");
        continue;
      }

      // If response is success and contains proxy info
      if (data.status === "success") {
        // isproxyip returns "proxy": 0 or 1 in the success response
        const vpn = data.proxy === 1;
        return res.status(200).json({
          success: true,
          vpn,
          proxy: data.proxy,
          raw: data
        });
      }

      // Unknown response format — treat as failure for this key
      lastError = new Error("Unexpected API response");
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  // All keys failed — attempt to get basic ip info from ipwho.is and return that to client
  try {
    const ipwho = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const ipInfo = ipwho.ok ? await ipwho.json() : { ip };
    return res.status(502).json({
      success: false,
      allKeysFailed: true,
      error: lastError ? lastError.message : "All API keys failed",
      ipInfo
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      allKeysFailed: true,
      error: lastError ? lastError.message : "All API keys failed",
      ipInfo: { ip }
    });
  }
}
