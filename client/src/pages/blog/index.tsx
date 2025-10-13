import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdSidebar } from "@/components/layout/AdSlots";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Calendar, Download } from "lucide-react";
import type { BlogPost } from "@shared/schema";

// === TUTORIAL DATA (ENGLISH GUIDE APPLIED) ===
const downloadGuideSteps = [
  {
    image: "/assets/guied_1.png",
    title: "Interface (First Look)",
    desc: "Upon landing on the VidDonloader homepage, you will see this clean interface. Your entire downloading process starts right here.",
  },
  {
    image: "/assets/guied_2.png",
    title: "Paste the Video Link",
    desc: "Copy the link of the video you wish to download from any supported platform (YouTube, Facebook, Instagram), and paste it into the 'Enter Video URL' field.",
  },
  {
    image: "/assets/guied_3.png",
    title: "Choose Quality",
    desc: "After pasting the link, use the 'Select Quality' dropdown menu to choose your preferred resolution (720p is Recommended).",
  },
  {
    image: "/assets/guied_4.png",
    title: "Click 'Download'",
    desc: "Once the quality is selected, click the 'Download MP4' button. Your video will start downloading immediately!",
  },
];
// ===========================================

export default function BlogIndex() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdBanner />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Video Editing Tips & Tutorials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how to get the most out of your videos with our comprehensive guides
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Blog Posts Column (lg:col-span-3) */}
            <div className="lg:col-span-3">

              {/* === FEATURED DOWNLOAD GUIDE CARD (ENGLISH GUIDE) === */}
              <Card className="mb-8 overflow-hidden shadow-xl border border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Download className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Quick Guide: How to Download (4 Steps)
                    </h2>
                  </div>

                  {/* Image Card Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {downloadGuideSteps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative w-full overflow-hidden rounded-lg shadow-md border border-border">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto object-cover aspect-video"
                          />
                          <div className="absolute top-0 left-0 bg-primary text-white font-bold px-2 py-1 rounded-br-lg text-xs">
                            STEP {index + 1}
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm text-foreground line-clamp-2">{step.title}</h4>
                        <p className="text-muted-foreground text-xs">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* ======================================================= */}

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* ... loading skeleton ... */}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {posts?.map((post) => (
                    <article key={post.id} className="card-hover">
                      {/* ... blog post card ... */}
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Column (lg:col-span-1) - Unchanged */}
            <div className="lg:col-span-1 space-y-6">
              <AdSidebar />
              {/* Popular Topics Card... */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}