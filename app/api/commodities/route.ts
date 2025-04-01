import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Interface for commodity data
 */
interface CommodityData {
  Name: string;
  Month: string;
  Last: string;
  Prev: string;
  High: string;
  Low: string;
  Chg: string;
  "Chg%": string;
  Time: string;
}

/**
 * Reformat a month string from "May 25" to "25 May"
 */
function reformatMonth(monthStr: string): string {
  const parts = monthStr.split(" ");
  if (parts.length === 2) {
    return `${parts[1]} ${parts[0]}`;
  }
  return monthStr;
}

/**
 * Fetch and extract commodity data from Investing.com
 */
async function fetchCommodityData(): Promise<Record<string, CommodityData>> {
  const url = "https://www.investing.com/commodities";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
  };

  try {
    const response = await axios.get(url, { headers });
    const html: string = response.data;
    const $ = cheerio.load(html);
    const data: Record<string, CommodityData> = {};

    // Select rows using the table row classes
    $("tr.datatable-v2_row__hkEus.dynamic-table-v2_row__ILVMx").each(
      (i, row) => {
        const aTag = $(row).find("a[title]");
        if (!aTag.length) return;

        // Extract commodity name from the title attribute, e.g. "Gold - (CFD)"
        const title = aTag.attr("title") || "";
        const commodityName = title.split(" - ")[0];

        if (commodityName === "Crude Oil WTI" || commodityName === "Gold") {
          // Extract all cell texts from the row
          const cells: string[] = [];
          $(row)
            .find("td")
            .each((i, cell) => {
              cells.push($(cell).text().trim());
            });

          // Remove the first element if it is an empty string (often used for a checkbox)
          if (cells.length > 0 && cells[0] === "") {
            cells.shift();
          }

          // Expected cell order:
          // [ "Name (derived)", "Month", "Last", "Prev.", "High", "Low", "Chg.", "Chg.%", "Time" ]
          const formattedData: CommodityData = {
            Name: commodityName,
            Month: reformatMonth(cells[1]),
            Last: cells[2],
            Prev: cells[3],
            High: cells[4],
            Low: cells[5],
            Chg: cells[6],
            "Chg%": cells[7],
            Time: cells[8],
          };

          data[commodityName] = formattedData;
        }
      }
    );

    console.log("Commodity data fetched:", data);
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching commodity data:", errorMessage);
    return {};
  }
}

/**
 * API Route handler for GET requests.
 */
export async function GET(): Promise<NextResponse> {
  const data = await fetchCommodityData();
  return NextResponse.json(data);
}
