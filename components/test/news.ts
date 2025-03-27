import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

interface Article {
  title: string;
  link: string;
  date: Date; // internal Date object
  image?: string;
  description: string;
  source: "TokenPost" | "Coinness";
}

// Truncate text to a maximum length
function truncate(text: string, maxLength = 150): string {
  return text.length <= maxLength
    ? text
    : text.slice(0, maxLength).trim() + "...";
}

// Format date in local style "YYYY.MM.DD HH:mm"
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// Format date in Korean time "YYYY.MM.DD HH:mm"
function formatDateKST(date: Date): string {
  const seoulTime = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );
  const year = seoulTime.getFullYear();
  const month = String(seoulTime.getMonth() + 1).padStart(2, "0");
  const day = String(seoulTime.getDate()).padStart(2, "0");
  const hours = String(seoulTime.getHours()).padStart(2, "0");
  const minutes = String(seoulTime.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// Parse "YYYY.MM.DD HH:mm" as IST
function parseISTDate(dateTimeStr: string): Date {
  const parts = dateTimeStr.trim().split(" ");
  if (parts.length === 2) {
    const datePart = parts[0].replace(/\./g, "-");
    const timePart = parts[1];
    const isoString = `${datePart}T${timePart}:00+05:30`;
    const parsedDate = new Date(isoString);
    if (isNaN(parsedDate.getTime())) {
      console.error("❌ Failed to parse date:", dateTimeStr);
      return new Date();
    }
    return parsedDate;
  }
  return new Date();
}

// Extract global date from text like "오늘, 2025년 3월 27일 목요일" → "2025.03.27"
function extractGlobalDate(dateText: string): string {
  const cleanText = dateText.replace("오늘,", "").trim();
  const regex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;
  const match = regex.exec(cleanText);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}.${month}.${day}`;
  }
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(now.getDate()).padStart(2, "0")}`;
}

// -------------- TokenPost Scraper --------------
async function fetchTokenPostNews(page: string): Promise<Article[]> {
  try {
    const url = `https://www.tokenpost.kr/blockchain?page=${page}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(data);
    const articles: Article[] = [];

    $(".list_left_item_article").each((_, el) => {
      const imageUrl = $(el).find(".list_item_image a img").attr("src") || "";
      const titleTag = $(el).find(".list_item_title a");
      const title = titleTag.text().trim();
      let link = titleTag.attr("href") || "";
      if (link.startsWith("/")) {
        link = "https://www.tokenpost.kr" + link;
      }

      const pubDateStr = $(el).find(".date_item .day").text().trim();
      const validDate = pubDateStr ? parseISTDate(pubDateStr) : new Date();

      const descriptionText = $(el)
        .find(".list_item_text_content")
        .text()
        .trim();
      const description = truncate(descriptionText, 150);

      articles.push({
        title,
        link,
        date: validDate,
        image: imageUrl,
        description,
        source: "TokenPost",
      });
    });

    console.log(`TokenPost => Page ${page}, articles:`, articles.length);
    return articles;
  } catch (error) {
    console.error("Error fetching TokenPost news:", error);
    return [];
  }
}

// -------------- Coinness Scraper --------------
interface RawCoinnessArticle {
  title: string;
  link: string;
  time: string; // e.g. "10:52"
  description: string;
  image: string;
  source: "Coinness";
}

async function fetchCoinnessPage(pageNum: number): Promise<Article[]> {
  // This is a single-page fetch. If you only have 1 page, ignore `pageNum`.
  // If Coinness has a pagination system, adapt the URL below accordingly.
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://coinness.com/", { waitUntil: "networkidle2" });
    // Wait for global date
    await page.waitForSelector("div.Flex-sc-on4cp8-2.eZCcWE", {
      timeout: 15000,
    });
    const globalDateText: string = await page.evaluate(() => {
      const el = document.querySelector("div.Flex-sc-on4cp8-2.eZCcWE");
      return el ? (el as HTMLElement).textContent?.trim() || "" : "";
    });
    const globalDate = extractGlobalDate(globalDateText);

    // Wait for articles
    await page.waitForSelector("div.BreakingNewsWrap-sc-glfxh-1", {
      timeout: 15000,
    });
    const rawArticles = (await page.evaluate(() => {
      const blocks = Array.from(
        document.querySelectorAll("div.BreakingNewsWrap-sc-glfxh-1")
      );
      return blocks.map((block) => {
        const timeElem = block.querySelector("div.TimeBlock-sc-glfxh-2.fOybcI");
        const rawTimeStr = timeElem
          ? (timeElem as HTMLElement).innerText.trim()
          : "NO_TIME";

        const titleElem = block.querySelector(
          "div.BreakingNewsTitle-sc-glfxh-4 a"
        );
        const title = titleElem
          ? (titleElem as HTMLElement).innerText.trim()
          : "No title";
        let link = titleElem ? titleElem.getAttribute("href") || "" : "";
        if (link.startsWith("/")) {
          link = "https://coinness.com" + link;
        }
        const descElem = block.querySelector(
          "div.BreakingNewsContents-sc-glfxh-5"
        );
        const description = descElem
          ? (descElem as HTMLElement).innerText.trim() || "No description"
          : "No description";

        return {
          title,
          link,
          time: rawTimeStr, // e.g. "10:52"
          image: "",
          description,
          source: "Coinness" as const,
        };
      });
    })) as RawCoinnessArticle[];

    await browser.close();

    // Convert raw time + global date into a Date
    const finalArticles: Article[] = rawArticles.map((raw) => {
      if (!raw.time || raw.time === "NO_TIME") {
        return { ...raw, date: new Date() };
      }
      const fullDateStr = `${globalDate} ${raw.time}`; // e.g. "2025.03.27 10:52"
      const parsedDate = parseISTDate(fullDateStr);
      return { ...raw, date: parsedDate };
    });

    console.log(
      `Coinness => Page ${pageNum}, final articles: ${finalArticles.length}`
    );
    return finalArticles;
  } catch (error) {
    console.error("Error fetching Coinness page:", pageNum, error);
    return [];
  }
}

async function fetchCoinnessAllPages(): Promise<Article[]> {
  // If you only want page 1, just do:
  // return await fetchCoinnessPage(1);
  //
  // If you want multiple pages, do:
  const pages = [1, 2]; // or [1, 2, 3, ...]
  let all: Article[] = [];
  for (const p of pages) {
    const pageArticles = await fetchCoinnessPage(p);
    all = [...all, ...pageArticles];
  }
  return all;
}

// -------------- Merge and Sort --------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1"; // For TokenPost
  const limit = Number.parseInt(searchParams.get("limit") || "9");

  try {
    // 1) TokenPost from the given page
    const tokenArticles = await fetchTokenPostNews(page);

    // 2) Coinness from one or multiple pages
    const coinArticles = await fetchCoinnessAllPages();

    // 3) De-duplicate Coinness based on title+desc
    //    That way if the same article reappears on multiple pages, we only keep one.
    const coinMap = new Map<string, Article>();
    for (const c of coinArticles) {
      const key = `${c.title}::${c.description}`; // combine them for uniqueness
      if (!coinMap.has(key)) {
        coinMap.set(key, c);
      }
    }
    const dedupedCoin = Array.from(coinMap.values());

    // 4) Balanced selection
    const tokenCount = Math.ceil(limit / 2);
    const coinCount = limit - tokenCount;
    const selectedToken = tokenArticles.slice(0, tokenCount);
    const selectedCoin = dedupedCoin.slice(0, coinCount);

    // 5) Merge & sort descending by date
    const mergedArticles = [...selectedToken, ...selectedCoin].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // 6) Format: Coinness => KST, TokenPost => local
    const formattedArticles = mergedArticles.map((article, index) => {
      const displayDate =
        article.source === "Coinness"
          ? formatDateKST(article.date)
          : formatDateLocal(article.date);
      return { ...article, date: displayDate };
    });

    console.log("Merged & sorted articles =>", formattedArticles);
    return NextResponse.json({ articles: formattedArticles });
  } catch (error: any) {
    console.error("Error fetching merged news:", error);
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}
