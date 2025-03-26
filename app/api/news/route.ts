import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  image?: string;
  description: string;
}

function truncate(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = Number.parseInt(searchParams.get("limit") || "9"); // Default to 9 items per page

  try {
    const url = `https://www.tokenpost.kr/blockchain?page=${page}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    const $ = cheerio.load(data);
    const articles: Article[] = [];

    $(".list_left_item_article").each((_, el) => {
      // Extract image URL
      const imageUrl = $(el).find(".list_item_image a img").attr("src");

      // Extract title and link
      const titleTag = $(el).find(".list_item_title a");
      const title = titleTag.text().trim();
      let link = titleTag.attr("href") || "";
      if (link.startsWith("/")) {
        link = "https://www.tokenpost.kr" + link;
      }

      // Extract publication date
      const pubDate = $(el).find(".date_item .day").text().trim();

      // Extract description and truncate it (simulating two lines)
      const descriptionText = $(el)
        .find(".list_item_text_content")
        .text()
        .trim();
      const description = truncate(descriptionText, 150); // adjust length as needed

      articles.push({ title, link, pubDate, image: imageUrl, description });

      // If we've reached the requested limit, stop processing
      if (articles.length >= limit) {
        return false; // Break out of the .each() loop
      }
    });

    return NextResponse.json({ articles });
  } catch (error: unknown) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: (error as Error).toString() },
      { status: 500 }
    );
  }
}
