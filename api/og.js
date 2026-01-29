import ogs from "open-graph-scraper";

export default async function handler(req, res) {
  try {
    const url = req.query?.url;
    if (!url) return res.status(400).json({ error: "Missing ?url=" });

    // Basic safety: only allow http/https
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const { error, result } = await ogs({
      url,
      timeout: 10000,
      fetchOptions: {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; OGPreviewBot/1.0)"
        }
      }
    });

    if (error) return res.status(422).json({ error: "Could not fetch OG data" });

    const image =
      result.ogImage?.url ||
      (Array.isArray(result.ogImage) ? result.ogImage?.[0]?.url : "") ||
      "";

    return res.status(200).json({
      url: result.requestUrl || url,
      title: result.ogTitle || result.twitterTitle || "",
      description: result.ogDescription || result.twitterDescription || "",
      image,
      siteName: result.ogSiteName || "",
      type: result.ogType || ""
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
