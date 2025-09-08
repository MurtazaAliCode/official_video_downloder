import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  id: string;
  progress?: number;
}

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  uploadedFile?: UploadedFile;
  isUploading?: boolean;
  className?: string;
}

export function UploadBox({
  onFileSelect,
  onFileRemove,
  uploadedFile,
  isUploading = false,
  className,
}: UploadBoxProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setIsDragOver(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.quicktime'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (uploadedFile) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center">
                <File className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground" data-testid="uploaded-file-name">
                  {uploadedFile.file.name}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="uploaded-file-info">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFileRemove}
                data-testid="remove-file-button"
                className="text-destructive hover:text-destructive/80"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "upload-area rounded-xl p-12 text-center cursor-pointer",
            (isDragActive || isDragOver) && "drag-over"
          )}
          data-testid="upload-area"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-card-foreground mb-2">
                {isDragActive ? "Drop your video here" : "Drag and drop your video here"}
              </p>
              <p className="text-muted-foreground mb-4">or click to browse files</p>
              <p className="text-sm text-muted-foreground">
                Supports MP4, AVI, MOV (Max 500MB)
              </p>
            </div>
            <Button 
              className="btn-gradient text-primary-foreground hover:scale-105 transition-all"
              disabled={isUploading}
              data-testid="choose-file-button"
            >
              {isUploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
