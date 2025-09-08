import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdSidebar } from "@/components/layout/AdSlots";
import { UploadBox } from "@/components/ui/upload-box";
import { VideoProcessor } from "@/components/video/processor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadedFile {
  file: File;
  id: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      setUploadedFile({
        file,
        id: result.file.id,
      });
      
      toast({
        title: "File uploaded successfully",
        description: "Your video is ready for processing.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again with a different file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(undefined);
  };

  const handleProcess = async (data: any) => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/process', {
        action: data.action,
        filePath: uploadedFile.file.name, // This would be the actual file path from upload
        fileName: uploadedFile.file.name,
        fileSize: uploadedFile.file.size,
        options: {
          ...(data.action === 'compress' && { quality: data.compressionQuality }),
          ...(data.action === 'convert' && { format: data.outputFormat }),
          ...(data.action === 'trim' && { 
            startTime: data.startTime, 
            endTime: data.endTime 
          }),
          ...(data.action === 'extract' && { format: data.audioFormat }),
          ...(data.action === 'watermark' && { 
            text: data.watermarkText,
            position: data.watermarkPosition 
          }),
        },
      });
      
      const result = await response.json();
      
      // Redirect to processing page
      setLocation(`/processing/${result.jobId}`);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdBanner />
      
      {/* Hero Section */}
      <section className="min-h-screen dark:gradient-bg-dark gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-background/5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Process Your Videos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Like a Pro
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Free online video processing tool for compression, format conversion, trimming, audio extraction, and watermarking. Safe, secure, and privacy-focused.
            </p>
          </div>

          {/* Main Content Area */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
            {/* Upload and Processing Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Upload Box */}
              <UploadBox
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                uploadedFile={uploadedFile}
                isUploading={isUploading}
              />

              {/* Processing Options */}
              {uploadedFile && (
                <VideoProcessor
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                />
              )}
            </div>

            {/* Sidebar with Ads and Features */}
            <div className="lg:col-span-1 space-y-6">
              {/* AdSense Sidebar */}
              <AdSidebar />

              {/* Features List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "100% Free", desc: "No registration required" },
                    { title: "Privacy Focused", desc: "Files deleted after 24h" },
                    { title: "Multiple Formats", desc: "MP4, AVI, MOV support" },
                    { title: "Fast Processing", desc: "Cloud-powered servers" },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { value: "50,000+", label: "Videos Processed" },
                    { value: "15,000+", label: "Happy Users" },
                    { value: "500MB", label: "Max File Size" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Video Processing Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to edit, convert, and optimize your videos in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Video Compression",
                desc: "Reduce file size without losing quality. Perfect for sharing on social media or saving storage space.",
                features: ["Multiple quality options", "Maintains video quality", "Fast processing"],
                color: "blue",
              },
              {
                title: "Format Conversion", 
                desc: "Convert between popular video formats like MP4, AVI, MOV, and even create GIFs from short clips.",
                features: ["MP4, AVI, MOV support", "GIF creation", "Universal compatibility"],
                color: "green",
              },
              {
                title: "Video Trimming",
                desc: "Cut and trim your videos to the perfect length. Remove unwanted parts with precise time controls.",
                features: ["Precise time selection", "Multiple segments", "Preview before processing"],
                color: "purple",
              },
              {
                title: "Audio Extraction",
                desc: "Extract high-quality audio from your videos. Perfect for creating podcasts or music files.",
                features: ["MP3 and WAV output", "High-quality audio", "Preserve original quality"],
                color: "yellow",
              },
              {
                title: "Add Watermarks",
                desc: "Protect your content with custom text or logo watermarks. Choose position and opacity to match your brand.",
                features: ["Text or logo watermarks", "Custom positioning", "Adjustable transparency"],
                color: "pink",
              },
              {
                title: "Privacy & Security",
                desc: "Your videos are processed securely and automatically deleted after 24 hours. We don't store your content.",
                features: ["Automatic file deletion", "No data collection", "Secure processing"],
                color: "red",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-lg flex items-center justify-center mb-4`}>
                    <div className={`w-6 h-6 text-${feature.color}-500`}>
                      <CheckCircle />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.desc}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {feature.features.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
