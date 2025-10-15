import youtubedl from 'youtube-dl-exec';

// Dynamic binary path: Windows uses default, Linux uses repo binary
const isWindows = process.platform === 'win32';
const ytDlpPath = isWindows ? undefined : process.env.YT_DLP_PATH || './yt-dlp';
const ytDlp = youtubedl(ytDlpPath);

/**
 * Fetch video title using youtube-dl-exec (wrapper for yt-dlp)
 */
export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    // Robust URL validation
    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
        console.error('Invalid or missing URL:', videoUrl);
        return null;
    }

    try {
        console.log(`🔍 Fetching title for: ${videoUrl}`);

        // JSON dump (no download)
        const jsonOutput = await ytDlp(videoUrl, {
            dumpSingleJson: true,
            noDownload: true,
            noWarnings: true,
        });

        const title = jsonOutput.title || 'Unknown Title';
        console.log(`✅ Title fetched: ${title}`);
        return title;

    } catch (error) {
        console.error('Title fetch error:', error);
        return null;
    }
}