import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { log } from './vite';

const execAsync = promisify(spawn);

const isWindows = process.platform === 'win32';
const ytDlpPath = isWindows ? path.join(process.cwd(), 'yt-dlp.exe') : path.join(process.cwd(), 'yt-dlp');

export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    log(`getTitleFromYtDlp called with: ${videoUrl}`, 'yt-dlp-utils');
    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
        log(`Invalid or missing URL: ${videoUrl}`, 'yt-dlp-utils');
        return null;
    }

    try {
        log(`Checking yt-dlp binary at: ${ytDlpPath}`, 'yt-dlp-utils');
        if (!(await fs.access(ytDlpPath).then(() => true).catch(() => false))) {
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}. Please verify binary in server directory.`);
        }

        const args = ['--dump-json', '--no-download', '--no-warnings', '--ignore-errors', videoUrl];
        log(`Executing yt-dlp with path: ${ytDlpPath}, args: ${args.join(' ')}`, 'yt-dlp-utils');
        const { stdout } = await execAsync(ytDlpPath, args, { shell: isWindows });
        const jsonOutput = JSON.parse(stdout.toString());
        const title = jsonOutput.title || 'Unknown Title';
        log(`✅ Title fetched: ${title}`, 'yt-dlp-utils');
        return title;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Title fetch error: ${errorMessage}`, 'yt-dlp-utils');
        return null;
    }
}