import * as XLSX from "xlsx";
import fs from "fs";
import OrgCurrency from "../../models/OrgCurrency";

export class ExcelCurrencyImporter {
    static async importCurrencies(filePath: string, user: any, chunkSize = 100): Promise<any[]> {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let buffer: any[] = [];
        let allAddedCurrencies: any[] = [];

        for (const row of rows.slice(1)) {
            const [currency, round_setting, is_main_raw] = row;

            if (!currency || !round_setting) continue;

            const is_main = String(is_main_raw).toLowerCase() === "true";

            buffer.push({
                currency: currency.trim(),
                round_setting: round_setting.trim().toLowerCase(),
                is_main,
            });

            if (buffer.length >= chunkSize) {
                const added = await this.processChunk(buffer, user);
                allAddedCurrencies.push(...added);
                buffer = [];
            }
        }

        if (buffer.length > 0) {
            const added = await this.processChunk(buffer, user);
            allAddedCurrencies.push(...added);
        }

        fs.unlinkSync(filePath);
        return allAddedCurrencies;
    }

    static async processChunk(chunk: any[], user: any): Promise<any[]> {
        const addedCurrencies: any[] = [];

        for (const item of chunk) {
            const existing = await OrgCurrency.findOne({
                where: {
                    currency: item.currency,
                    organization_id: user.organization_id,
                },
            });

            if (existing) continue;

            const newCurrency = await OrgCurrency.create({
                currency: item.currency,
                round_setting: item.round_setting,
                is_main: item.is_main || false,
                organization_id: user.organization_id,
            });

            addedCurrencies.push(newCurrency);
        }

        return addedCurrencies;
    }
}
