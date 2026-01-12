import fs from 'fs';
import path from 'path';

export const log = (level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    } else {
        console.log(`${prefix} ${message}`);
    }

    if (level === 'ERROR') {
        saveErrorToLog(message, data);
    }
};

function saveErrorToLog(message: string, data?: any) {
    try {
        const logFilePath = path.join(process.cwd(), 'errors.log');
        let fileContent = message + '\n';
        
        if (data) {
            const dataString = data instanceof Error ? data.stack : JSON.stringify(data);
            fileContent += `Details: ${dataString}\n`;
        }
        
        fs.appendFileSync(logFilePath, fileContent);
        
    } catch (fsError) {
        console.error('CRITICAL: Failed to write to errors.log', fsError);
    }
}