import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdInContent, AdSidebar } from "@/components/layout/AdSlots";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@shared/schema";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', slug],
    enabled: !!slug,
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const contentParts = post.content.split('\n\n');
  const midpoint = Math.floor(contentParts.length / 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">
                {contentParts.slice(0, midpoint).join('\n\n')}
              </div>
              
              {/* In-content Ad */}
              <AdInContent />
              
              <div className="whitespace-pre-wrap">
                {contentParts.slice(midpoint).join('\n\n')}
              </div>
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatDate(post.updatedAt)}
                </div>
                <Link href="/blog">
                  <Button variant="outline">
                    More Articles
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </Link>
              </div>
            </footer>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AdSidebar />
            
            {/* Related Articles */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {[
                    "Best Video Formats for Social Media",
                    "Trim Videos Without Software", 
                    "Extract Audio from Video Free",
                  ].map((title, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {title}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Table of Contents */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-card-foreground mb-4">Table of Contents</h3>
                <div className="space-y-2 text-sm">
                  {post.content.match(/^#+ .+/gm)?.slice(0, 5).map((heading, index) => (
                    <a
                      key={index}
                      href="#"
                      className="block text-muted-foreground hover:text-primary transition-colors pl-2 border-l-2 border-transparent hover:border-primary"
                    >
                      {heading.replace(/^#+\s/, '')}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
