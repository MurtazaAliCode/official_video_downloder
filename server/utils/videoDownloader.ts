import { execFile } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs/promises';  // NEW: For file check

const execFileAsync = promisify(execFile);

export async function downloadVideoWithYtDlp(
    url: string,
    outputPath: string,
    format: string,
    quality: string,
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
    try {
        const ytDlpPath = path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe');
        console.log(`Attempting to use yt-dlp path: ${ytDlpPath}`); // Enhanced debug

        // Check if yt-dlp executable exists
        if (!(await fs.access(ytDlpPath).then(() => true).catch(() => false))) {
            throw new Error(`yt-dlp executable not found at ${ytDlpPath}. Please install youtube-dl-exec or verify path.`);
        }

        const options = {
            format: format === 'mp3' ? 'bestaudio/best' : `best[height<=${quality.replace('p', '')}][ext=mp4]/best`,
            output: outputPath,
            'no-warnings': true,
            'ignore-errors': true,
        };

        const args = [
            url,
            '--format', options.format,
            '--output', options.output,
            '--no-warnings',
            '--ignore-errors',
        ];

        console.log(`Running yt-dlp with args: ${args.join(' ')}`); // Debug args
        const { stdout, stderr } = await execFileAsync(ytDlpPath, args);

        if (stderr) {
            console.error('yt-dlp stderr:', stderr);
            throw new Error(`Download failed: ${stderr}`);
        }

        // Verify file creation
        await fs.access(outputPath).catch(err => {
            throw new Error(`File not created at ${outputPath}: ${err.message}`);
        });

        console.log('Download successful, file saved at:', outputPath);
        return { success: true };
    } catch (error) {
        console.error('youtube-dl-exec download failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}