export default async function handler(req, res) {
  const ip = req.query.ip;
  if (!ip) return res.json({ success: false, error: "No IP provided" });

  try {
    const vpnRes = await fetch(`https://ipqualityscore.com/api/json/ip/vN7uu7KJuOb1QIrnGXEBwWaj6ztIFnTb/${ip}`);
    const data = await vpnRes.json();

    res.json({
      vpn: data.vpn || data.proxy || data.tor,
      raw: data
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}
