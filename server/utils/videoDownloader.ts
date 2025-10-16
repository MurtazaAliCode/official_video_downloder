import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { log } from '../vite';

const execAsync = promisify(spawn);

const isWindows = process.platform === 'win32';
const ytDlpPath = isWindows ? path.join(process.cwd(), 'yt-dlp.exe') : path.join(process.cwd(), 'yt-dlp');

export async function downloadVideoWithYtDlp(
    url: string,
    outputPath: string,
    format: string,
    quality: string,
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
    log(`downloadVideoWithYtDlp called with URL: ${url}, format: ${format}, quality: ${quality}`, 'videoDownloader');
    if (!url || typeof url !== 'string' || !url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
        log(`Invalid download URL: ${url}`, 'videoDownloader');
        return { success: false, error: 'Invalid or missing URL' };
    }

    try {
        log(`Checking yt-dlp binary at: ${ytDlpPath}`, 'videoDownloader');
        if (!(await fs.access(ytDlpPath).then(() => true).catch(() => false))) {
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}. Please verify binary in server directory.`);
        }

        const args = [
            '--format', format === 'mp3' ? 'bestaudio/best' : `bestvideo[height<=${quality.replace('p', '')}][ext=mp4]/best`,
            '--output', outputPath,
            '--no-warnings',
            '--ignore-errors',
            '--no-check-certificates',
            '--add-header', 'referer:youtube.com',
            '--add-header', 'user-agent:googlebot',
            url
        ];
        log(`Executing yt-dlp with path: ${ytDlpPath}, args: ${args.join(' ')}`, 'videoDownloader');

        const process = spawn(ytDlpPath, args, { shell: isWindows });

        process.stdout?.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d)%/);
            if (match && onProgress) {
                const percent = parseFloat(match[1]);
                log(`Download progress for ${url}: ${percent}%`, 'videoDownloader');
                onProgress(percent);
            }
        });

        process.stderr?.on('data', (data) => {
            log(`yt-dlp stderr: ${data.toString()}`, 'videoDownloader');
        });

        await execAsync(ytDlpPath, args, { shell: isWindows });
        log(`Verifying file at: ${outputPath}`, 'videoDownloader');
        await fs.access(outputPath).catch((err) => {
            throw new Error(`File not created at ${outputPath}: ${err.message}`);
        });

        log(`Download completed for ${url}`, 'videoDownloader');
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`Download error for ${url}: ${errorMessage}`, 'videoDownloader');
        return { success: false, error: errorMessage };
    }
}