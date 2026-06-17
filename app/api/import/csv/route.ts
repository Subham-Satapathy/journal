import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapCsvColumns, ColumnMapping } from "@/lib/gemini";
import { parseTradeDate } from "@/lib/datetime";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mappingStr = formData.get("mapping") as string | null;
    const action = (formData.get("action") as string) || "preview";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: string[][] = [];
    let headers: string[] = [];

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
      if (parsed.data.length > 0) {
        headers = parsed.data[0] as string[];
        rows = parsed.data.slice(1) as string[][];
      }
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      if (data.length > 0) {
        headers = data[0] as string[];
        rows = data.slice(1) as string[][];
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type. Use CSV or Excel." }, { status: 400 });
    }

    if (action === "preview") {
      const sampleRows = rows.slice(0, 3);
      let mapping: ColumnMapping | null = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          mapping = await mapCsvColumns(headers, sampleRows);
        } catch (e) {
          console.error("Gemini column mapping failed:", e);
        }
      }

      return NextResponse.json({ headers, sampleRows, mapping, totalRows: rows.length });
    }

    if (action === "import" && mappingStr) {
      const mapping: ColumnMapping = JSON.parse(mappingStr);

      // Always return string — Excel cells can be numbers/dates/booleans
      const getVal = (row: string[], field: keyof ColumnMapping): string | null => {
        const header = mapping[field];
        if (!header) return null;
        const idx = headers.indexOf(header);
        if (idx === -1) return null;
        const val = row[idx];
        if (val === null || val === undefined || val === "") return null;
        return String(val);
      };

      // Safe numeric parser — handles numbers, strings like "$1,234.56", already-numeric values
      const parseNum = (val: string | null): number | null => {
        if (val === null) return null;
        const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
        return isNaN(n) ? null : n;
      };

      // Parse dates — timezone in sheet is respected; plain datetimes treated as UTC
      const parseDate = parseTradeDate;

      // Auto-detect orderId column if Gemini didn't map it:
      // look for a header whose sample values look like UUIDs or long numeric IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const longIdRegex = /^[a-zA-Z0-9_-]{12,}$/;
      if (!mapping.orderId) {
        for (let i = 0; i < headers.length; i++) {
          const sampleVals = rows.slice(0, 5).map((r) => String(r[i] ?? "").trim()).filter(Boolean);
          if (sampleVals.length > 0 && sampleVals.every((v) => uuidRegex.test(v) || longIdRegex.test(v))) {
            mapping.orderId = headers[i];
            break;
          }
        }
      }

      const trades = rows
        .filter((row) => row.some((cell) => cell !== null && cell !== undefined && String(cell).trim()))
        .map((row) => {
          const symbol = getVal(row, "symbol");
          const side = getVal(row, "side");
          const entryPriceStr = getVal(row, "entryPrice");
          const dateStr = getVal(row, "date");
          const quantityStr = getVal(row, "quantity");

          if (!symbol || !side || !entryPriceStr || !dateStr) return null;

          const entryPrice = parseNum(entryPriceStr);
          const quantity = parseNum(quantityStr) ?? 1;
          if (entryPrice === null || isNaN(quantity)) return null;

          const orderIdVal = getVal(row, "orderId");

          return {
            symbol: symbol.toUpperCase().trim(),
            side: side.toUpperCase().trim(),
            entryPrice,
            exitPrice: parseNum(getVal(row, "exitPrice")),
            quantity,
            pnl: parseNum(getVal(row, "pnl")),
            pnlPercent: parseNum(getVal(row, "pnlPercent")),
            fees: parseNum(getVal(row, "fees")) ?? 0,
            date: parseDate(dateStr),
            closeDate: getVal(row, "closeDate") ? parseDate(getVal(row, "closeDate")) : null,
            exchange: getVal(row, "exchange") || null,
            orderId: orderIdVal || null,
            importSource: fileName.endsWith(".csv") ? "csv" : "excel",
          };
        })
        .filter(Boolean);

      if (trades.length === 0) {
        return NextResponse.json({ error: "No valid trades found in file" }, { status: 400 });
      }

      const result = await prisma.trade.createMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: trades as any[],
        skipDuplicates: true,
      });

      const skipped = trades.length - result.count;
      return NextResponse.json({
        imported: result.count,
        skipped,
        message: skipped > 0
          ? `${result.count} new trades imported, ${skipped} duplicates skipped`
          : `${result.count} trades imported successfully`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/import/csv error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
