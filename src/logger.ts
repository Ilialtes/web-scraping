/**
 * Standardized logger for the scraper.
 * formatting: [ISO_TIMESTAMP] [LEVEL] Message
 */
export const log = (level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    } else {
        console.log(`${prefix} ${message}`);
    }
};