import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdBanner, AdSidebar } from "@/components/layout/AdSlots";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import type { BlogPost } from "@shared/schema";

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
            {/* Blog Posts */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-xl h-48 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {posts?.map((post) => (
                    <article key={post.id} className="card-hover">
                      <Card className="overflow-hidden">
                        {/* Mock Image */}
                        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Blog Image</span>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.readTime} min read</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-card-foreground mb-3 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <Link href={`/blog/${post.slug}`}>
                            <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                              Read More
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <AdSidebar />
              
              {/* Popular Topics */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-card-foreground mb-4">Popular Topics</h3>
                  <div className="space-y-2">
                    {[
                      "Video Compression",
                      "Format Conversion", 
                      "Audio Extraction",
                      "Video Trimming",
                      "Watermarking",
                      "Social Media Optimization",
                    ].map((topic, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                      >
                        {topic}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
