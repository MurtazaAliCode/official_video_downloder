export function AdBanner() {
  return (
    <div className="w-full bg-muted/30 border-b border-border" data-testid="ad-banner">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            <span className="text-sm">AdSense Banner (728x90)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdSidebar() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-lg" data-testid="ad-sidebar">
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        <span className="text-sm text-center">
          AdSense
          <br />
          Sidebar
          <br />
          (300x250)
        </span>
      </div>
    </div>
  );
}

export function AdInContent() {
  return (
    <div className="my-8 flex justify-center" data-testid="ad-in-content">
      <div className="w-full max-w-2xl h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        <span className="text-sm">AdSense In-Content (728x90)</span>
      </div>
    </div>
  );
}
