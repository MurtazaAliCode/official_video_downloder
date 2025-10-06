import youtubedl from 'youtube-dl-exec';

/**
 * Fetch video title using youtube-dl-exec (wrapper for yt-dlp)
 */
export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    try {
        console.log(`🔍 Fetching title for: ${videoUrl}`);

        // JSON dump (no download)
        const jsonOutput = await youtubedl(videoUrl, {
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