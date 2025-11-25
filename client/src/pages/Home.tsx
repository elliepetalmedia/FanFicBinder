import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateEpub, mockFetchUrl, type Chapter } from "@/lib/epub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Book, Download, Trash2, Plus, Link as LinkIcon, FileText, Loader2 } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual Entry State
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  // Metadata State
  const [bookTitle, setBookTitle] = useState("My FanFic Binder");
  const [authorName, setAuthorName] = useState("Various Authors");

  const handleFetchUrl = async () => {
    if (!urlInput) return;

    setIsLoading(true);
    try {
      const result = await mockFetchUrl(urlInput);
      const newChapter: Chapter = {
        id: Date.now().toString(),
        title: result.title,
        content: result.content,
        wordCount: result.content.split(/\s+/).length,
      };
      
      setChapters([...chapters, newChapter]);
      setUrlInput("");
      toast({
        title: "Chapter Added",
        description: `Successfully fetched "${result.title}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManual = () => {
    if (!manualTitle || !manualContent) return;

    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: manualTitle,
      content: manualContent.replace(/\n/g, "<br>"), // Simple formatting
      wordCount: manualContent.split(/\s+/).length,
    };

    setChapters([...chapters, newChapter]);
    setManualTitle("");
    setManualContent("");
    setIsManualDialogOpen(false);
    toast({
      title: "Chapter Added",
      description: `"${newChapter.title}" added to binder.`,
    });
  };

  const handleRemoveChapter = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id));
  };

  const handleDownload = async () => {
    if (chapters.length === 0) {
      toast({
        title: "Binder Empty",
        description: "Add some chapters before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateEpub(chapters, { title: bookTitle, author: authorName });
      toast({
        title: "Download Started",
        description: "Your EPUB is being generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate EPUB.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">
              FanFic<span className="text-primary">Binder</span>
            </h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Build your ebook, chapter by chapter.
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto space-y-1">
          <p className="text-lg text-foreground/90">
            FanFicBinder helps you archive web serials and fanfiction into clean EPUBs for your e-reader.
          </p>
          <p className="text-sm text-muted-foreground">
            See below for details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input Tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Add Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="url">URL Fetcher</TabsTrigger>
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="url-input">Story URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="url-input" 
                          placeholder="https://archiveofourown.org/..." 
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supports AO3, Wattpad, RoyalRoad, and most article sites.
                      </p>
                    </div>
                    <Button 
                      onClick={handleFetchUrl} 
                      disabled={isLoading || !urlInput} 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Fetch Chapter
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-4">
                    <div className="p-4 border border-dashed border-border rounded-lg text-center space-y-3">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Paste content from a document or write your own.</p>
                      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Custom Chapter
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                          <DialogHeader>
                            <DialogTitle>Add Custom Chapter</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="chapter-title">Chapter Title</Label>
                              <Input 
                                id="chapter-title" 
                                value={manualTitle}
                                onChange={(e) => setManualTitle(e.target.value)}
                                placeholder="Chapter 1: The Beginning"
                                className="bg-input border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="chapter-content">Content</Label>
                              <Textarea 
                                id="chapter-content" 
                                value={manualContent}
                                onChange={(e) => setManualContent(e.target.value)}
                                placeholder="Paste story text here..."
                                className="min-h-[300px] font-serif bg-input border-border"
                              />
                            </div>
                            <Button onClick={handleAddManual} className="w-full bg-primary text-primary-foreground">
                              Save Chapter
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Book Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-title">Book Title</Label>
                  <Input 
                    id="book-title" 
                    value={bookTitle} 
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="bg-input border-border font-serif font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author-name">Author</Label>
                  <Input 
                    id="author-name" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Binder Queue */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                Binder Queue
                <span className="text-sm font-sans font-normal bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  {chapters.length}
                </span>
              </h2>
              {chapters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setChapters([])} className="text-destructive hover:text-destructive/80">
                  Clear All
                </Button>
              )}
            </div>

            <Card className="flex-1 border-border bg-card/50 backdrop-blur-sm flex flex-col min-h-[400px]">
              <CardContent className="p-0 flex-1 flex flex-col">
                {chapters.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <div className="w-16 h-16 border-2 border-dashed border-border rounded-full flex items-center justify-center mb-4">
                      <Book className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">Your binder is empty</p>
                    <p className="text-sm">Add chapters from the left to start building your ebook.</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 h-[500px]">
                    <div className="divide-y divide-border">
                      {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="p-4 flex items-center justify-between group hover:bg-accent/5 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium font-serif text-foreground">{chapter.title}</h3>
                              <p className="text-xs text-muted-foreground">{chapter.wordCount} words</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChapter(chapter.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              {chapters.length > 0 && (
                <div className="p-4 border-t border-border bg-card rounded-b-lg">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download EPUB ({chapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()} words)
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* SEO Article */}
        <article className="max-w-3xl mx-auto mt-24 text-muted-foreground font-sans space-y-8">
          <Separator className="bg-border" />
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Read Fanfiction Offline on Kindle & eReaders</h2>
            <p className="leading-relaxed mb-6">
              FanFicBinder is the ultimate tool for archiving web serials, fanfiction, and articles. Whether you are saving a deleted fic from AO3, compiling a series from Wattpad, or just prefer reading long-form content on an e-ink screen, our tool makes it instant.
            </p>

            <h3 className="text-xl font-bold text-foreground mb-3">How it Works</h3>
            <p className="leading-relaxed mb-4">
              Most fanfiction sites are designed for browsers, not e-readers. We use Mozilla's advanced "Readability" engine to strip away the sidebars, ads, and comments, leaving only the story text. We then package it into a valid EPUB file compatible with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Amazon Kindle (via Send-to-Kindle)</li>
              <li>Apple Books (iPad/iPhone)</li>
              <li>Kobo & Nook</li>
            </ul>

            <h3 className="text-xl font-bold text-foreground mb-3">Why "Bind" Your Fics?</h3>
            <p className="leading-relaxed">
              Authors sometimes delete their work. By downloading an EPUB, you ensure you have a permanent offline copy of your favorite stories. Plus, reading on an e-reader reduces eye strain compared to scrolling on a phone.
            </p>
          </div>
          
          {/* Ad Slots placeholders */}
          <div id="ad-footer" className="w-full h-24 bg-secondary/30 rounded flex items-center justify-center text-xs text-muted-foreground">
            Ad Space
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Ellie Petal Media. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
