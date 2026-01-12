import fs from 'fs';
import path from 'path';
import { SkuInput } from '../product.types';
import { log } from '../logger';

export function loadSkus(filename: string = 'skus.json'): SkuInput[] {
    try {
        const filePath = path.join(process.cwd(), filename);
        
        if (!fs.existsSync(filePath)) {
            log('ERROR', `File not found: ${filePath}`);
            return [];
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        
        if (!rawData.trim()) {
            log('ERROR', `File is empty: ${filename}`);
            return [];
        }

        const parsed = JSON.parse(rawData);

        if (Array.isArray(parsed)) {
            log('INFO', `Loaded ${parsed.length} SKUs from ${filename} (Array Format)`);
            return parsed as SkuInput[];
        }

        if (parsed.skus && Array.isArray(parsed.skus)) {
            log('INFO', `Loaded ${parsed.skus.length} SKUs from ${filename} (Object Format)`);
            return parsed.skus as SkuInput[];
        }

        log('ERROR', `Invalid JSON format in ${filename}. Expected Array or Object with "skus" key.`);
        return [];

    } catch (error) {
        log('ERROR', `Failed to load SKUs from ${filename}`, error);
        return [];
    }
}