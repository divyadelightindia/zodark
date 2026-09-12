import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("topic") || "business technology AI startup";

    // Google News RSS Feed (Keyless & Fast)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!response.ok) {
      return NextResponse.json({ articles: [], error: "Failed to fetch news feed" }, { status: 502 });
    }

    const xmlText = await response.text();

    // Parse RSS <item> tags
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    const articles = items.slice(0, 5).map((item) => {
      const titleMatch = item.match(/<title>(.*?)<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/) || item.match(/<guid.*?>(.*?)<\/guid>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      const sourceMatch = item.match(/<source.*?>(.*?)<\/source>/);

      let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, "$1").trim() : "News Article";
      let link = linkMatch ? linkMatch[1].trim() : "#";
      let pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
      let source = sourceMatch ? sourceMatch[1].trim() : "Google News";

      // Clean HTML entities
      title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

      return { title, link, pubDate, source };
    });

    return NextResponse.json({ query, count: articles.length, articles });

  } catch (error) {
    console.error("News API Route Error:", error);
    return NextResponse.json(
      { articles: [], error: "Technical error fetching live news" },
      { status: 500 }
    );
  }
}
