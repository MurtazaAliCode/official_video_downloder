import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle } from "lucide-react";

interface DownloadLinkProps {
  jobId: string;
  fileName: string;
  onProcessAnother: () => void;
}

export function DownloadLink({ jobId, fileName, onProcessAnother }: DownloadLinkProps) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const downloadUrl = `/api/download/${jobId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `processed_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl mb-2">Processing Complete!</CardTitle>
          <p className="text-muted-foreground">Your video has been processed successfully.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold transition-all"
          data-testid="download-button"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Processed Video
        </Button>

        {/* Timer */}
        <p className="text-xs text-muted-foreground text-center" data-testid="expiry-timer">
          Download link expires in {formatTime(timeLeft)} • File will be automatically deleted after 24 hours
        </p>

        {/* Process Another Video */}
        <div className="pt-4">
          <Button
            onClick={onProcessAnother}
            variant="outline"
            className="w-full py-3 font-medium"
            data-testid="process-another-button"
          >
            Process Another Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
