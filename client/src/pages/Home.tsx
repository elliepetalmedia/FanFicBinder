import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCoverImage } from "@/hooks/useCoverImage";
import {
  countWords,
  plainTextToChapterContent,
  type Chapter,
} from "@/lib/chapter";
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
import { Link } from "wouter";
import { Download, Plus, Link as LinkIcon, FileText, Loader2, X, Settings } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";
import { BinderQueue } from "@/components/home/BinderQueue";
import { MetadataPanel } from "@/components/home/MetadataPanel";
import { OutputControls } from "@/components/home/OutputControls";
import { SeoArticle } from "@/components/home/SeoArticle";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Try manual entry.";
}

function isLikelyValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Home() {
  useSEO(seoRoutes.home);

  const { toast } = useToast();
  const {
    coverImage,
    coverPreview,
    handleCoverUpload,
    handleRemoveCover,
  } = useCoverImage((error) => {
    toast({
      title: error.title,
      description: error.description,
      variant: "destructive",
    });
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);

  // Manual Entry State
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  // Metadata State
  const [bookTitle, setBookTitle] = useState("My FanFic Binder");
  const [authorName, setAuthorName] = useState("Various Authors");

  // Formatting State
  const [font, setFont] = useState("serif");
  const [spacing, setSpacing] = useState("1.6");
  const [dropCaps, setDropCaps] = useState(false);
  const [outputFormat, setOutputFormat] = useState<"epub" | "reader">("epub");

  const [isMultiChapter, setIsMultiChapter] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: string }>({ current: 0, total: "?" });
  const [isFetchingSequence, setIsFetchingSequence] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const trimmedUrlInput = urlInput.trim();
  const canFetchUrl = isLikelyValidUrl(trimmedUrlInput) && !isLoading && !isFetchingSequence;
  const canSaveManualChapter = manualTitle.trim().length > 0 && manualContent.trim().length > 0;
  const totalWords = useMemo(
    () => chapters.reduce((acc, chapter) => acc + chapter.wordCount, 0),
    [chapters],
  );

  const handleFetchUrl = async () => {
    if (!canFetchUrl) return;

    if (isMultiChapter) {
      await handleFetchSequence();
      return;
    }

    setIsLoading(true);
    setToolStatus("Loading fetch tools...");
    try {
      const { mockFetchUrl } = await import("@/lib/epub");
      setToolStatus("Fetching chapter...");
      const result = await mockFetchUrl(trimmedUrlInput);
      const newChapter: Chapter = {
        id: Date.now().toString(),
        title: result.title,
        content: result.content,
        wordCount: countWords(result.content),
      };

      setChapters(prev => [...prev, newChapter]);
      setUrlInput("");
      toast({
        title: "Chapter Added",
        description: `Successfully fetched "${result.title}"`,
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setToolStatus(null);
      setIsLoading(false);
    }
  };

  const handleFetchSequence = async () => {
    if (!canFetchUrl) return;

    setIsFetchingSequence(true);
    setToolStatus("Loading fetch tools...");
    setFetchProgress({ current: 0, total: "?" });
    const controller = new AbortController();
    setAbortController(controller);

    let currentUrl = trimmedUrlInput;
    let chapterCount = 0;

    try {
      const { mockFetchUrl } = await import("@/lib/epub");
      setToolStatus("Fetching chapter sequence...");
      while (currentUrl && !controller.signal.aborted) {
        chapterCount++;
        setFetchProgress(prev => ({ ...prev, current: chapterCount }));

        // 1. Fetch with Retry Logic
        let result;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries && !controller.signal.aborted) {
          try {
            result = await mockFetchUrl(currentUrl);
            break; // Success
          } catch (err: unknown) {
            const errorMsg = getErrorMessage(err);
            if (errorMsg.includes("429") || errorMsg.includes("503") || errorMsg.includes("Too Many Requests")) {
              // Rate limit hit - wait 10s
              toast({
                title: "Rate Limit Detected",
                description: "Pausing for 10 seconds to cool down...",
                variant: "default",
              });
              await new Promise(resolve => setTimeout(resolve, 10000));
              retryCount++;
            } else {
              throw err; // Fatal error
            }
          }
        }

        if (!result) throw new Error("Max retries exceeded");

        // 2. Add to list
        const newChapter: Chapter = {
          id: Date.now().toString() + Math.random(),
          title: result.title,
          content: result.content,
          wordCount: countWords(result.content),
        };

        setChapters(prev => [...prev, newChapter]); // Functional update to ensure fresh state

        // 3. Check for next
        if (result.nextUrl && result.nextUrl !== currentUrl) {
          currentUrl = result.nextUrl;
          // 4. Polite dynamic delay (1.5s to 3.5s)
          const delay = Math.floor(Math.random() * 2000) + 1500;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          currentUrl = "";
        }

        // Safety break
        if (chapterCount > 50) {
          toast({
            title: "Sequence Limit Reached",
            description: "Stopped after 50 chapters to prevent browser issues.",
            variant: "default",
          });
          break;
        }
      }

      if (!controller.signal.aborted) {
        toast({
          title: "Sequence Complete",
          description: `Fetched ${chapterCount} chapters.`,
        });
        setUrlInput("");
      }

    } catch (error) {
      if (!controller.signal.aborted) {
        toast({
          title: "Sequence Interrupted",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    } finally {
      setToolStatus(null);
      setIsFetchingSequence(false);
      setAbortController(null);
    }
  };

  const cancelFetch = () => {
    if (abortController) {
      abortController.abort();
      setIsFetchingSequence(false);
      toast({
        title: "Stopped",
        description: "Fetching sequence cancelled.",
      });
    }
  };

  const handleAddManual = () => {
    if (!canSaveManualChapter) return;

    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: manualTitle.trim(),
      content: plainTextToChapterContent(manualContent),
      wordCount: countWords(manualContent),
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

    setIsExporting(true);
    try {
      if (outputFormat === 'reader') {
        setToolStatus("Loading Reader Mode exporter...");
        const { generateReaderModeHTML } = await import("@/lib/epub");
        setToolStatus("Generating Reader Mode file...");
        await generateReaderModeHTML(chapters, {
          title: bookTitle,
          author: authorName,
          cover: coverImage
        });
        toast({
          title: "Reader Mode HTML Ready",
          description: "Your file has been generated.",
        });
      } else {
        setToolStatus("Loading EPUB exporter...");
        const { generateEpub } = await import("@/lib/epub");
        setToolStatus("Generating EPUB...");
        await generateEpub(chapters, {
          title: bookTitle,
          author: authorName,
          cover: coverImage
        }, {
          font,
          spacing,
          dropCaps
        });
        toast({
          title: "Download Started",
          description: "Your EPUB is being generated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setToolStatus(null);
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center w-full mx-auto space-y-1">
          <p className="text-lg text-foreground/90">
            FanFicBinder turns web fiction, fanfiction, and articles into clean EPUBs or reader mode HTML for offline reading.
          </p>
          <p className="text-sm text-muted-foreground">
            Your binder stays on your device; URL fetching is only used to retrieve pages you request.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Input Tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border shadow-lg bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif text-xl">Add Content</CardTitle>
              <Link href="/faq" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors underline px-2 py-1">
                Help & FAQ
              </Link>
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
                          aria-invalid={trimmedUrlInput.length > 0 && !isLikelyValidUrl(trimmedUrlInput)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground" aria-live="polite">
                        {trimmedUrlInput.length > 0 && !isLikelyValidUrl(trimmedUrlInput)
                          ? "Enter a full URL starting with http:// or https://."
                          : "Best with AO3, RoyalRoad, and readable article pages. Wattpad usually needs manual entry."}
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <Checkbox
                          id="multi-chapter"
                          checked={isMultiChapter}
                          onCheckedChange={(checked) => setIsMultiChapter(checked === true)}
                          disabled={isFetchingSequence}
                        />
                        <Label htmlFor="multi-chapter" className="text-xs font-normal cursor-pointer">
                          Try to fetch following chapters automatically
                        </Label>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full border rounded-md px-3 bg-secondary/10">
                      <AccordionItem value="formatting" className="border-none">
                        <AccordionTrigger className="text-sm py-3 font-medium hover:no-underline">
                          <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Formatting Options
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                          <div className="grid gap-2">
                            <Label htmlFor="font-select">Font Family</Label>
                            <Select value={font} onValueChange={setFont}>
                              <SelectTrigger id="font-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="serif">Serif (Merriweather)</SelectItem>
                                <SelectItem value="sans">Sans-Serif (Open Sans)</SelectItem>
                                <SelectItem value="dyslexic">Dyslexic Friendly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="spacing-select">Line Spacing</Label>
                            <Select value={spacing} onValueChange={setSpacing}>
                              <SelectTrigger id="spacing-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1.2">Compact (1.2)</SelectItem>
                                <SelectItem value="1.6">Comfortable (1.6)</SelectItem>
                                <SelectItem value="1.8">Loose (1.8)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                              id="dropcaps"
                              checked={dropCaps}
                              onCheckedChange={(checked) => setDropCaps(checked === true)}
                            />
                            <Label htmlFor="dropcaps" className="font-normal cursor-pointer">
                              Add Drop Caps to Chapter Start
                            </Label>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {isFetchingSequence ? (
                      <Button
                        onClick={cancelFetch}
                        variant="destructive"
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Stop Fetching (Chapter {fetchProgress.current})
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFetchUrl}
                        disabled={!canFetchUrl}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isLoading || isFetchingSequence ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {toolStatus || (isMultiChapter ? `Fetching chapter ${fetchProgress.current || 1}...` : "Fetching...")}
                          </>
                        ) : (
                          <>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {isMultiChapter ? 'Start Chapter Fetch Sequence' : 'Fetch Chapter'}
                          </>
                        )}
                      </Button>
                    )}
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
                            <Button
                              onClick={handleAddManual}
                              disabled={!canSaveManualChapter}
                              className="w-full bg-primary text-primary-foreground"
                            >
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

            <MetadataPanel
              bookTitle={bookTitle}
              authorName={authorName}
              coverPreview={coverPreview}
              onBookTitleChange={setBookTitle}
              onAuthorNameChange={setAuthorName}
              onCoverUpload={handleCoverUpload}
              onRemoveCover={handleRemoveCover}
            />
          </div>

          <BinderQueue
            chapters={chapters}
            totalWords={totalWords}
            outputFormat={outputFormat}
            isExporting={isExporting}
            toolStatus={toolStatus}
            onClearChapters={() => setChapters([])}
            onRemoveChapter={handleRemoveChapter}
            onDownload={handleDownload}
            onOutputFormatChange={setOutputFormat}
          />
        </div>

        {/* Mobile Sticky Download Button */}
        {chapters.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border lg:hidden z-50 shadow-xl space-y-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <OutputControls
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
            />
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
              onClick={handleDownload}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {toolStatus || `Download ${outputFormat === 'epub' ? 'EPUB' : 'Reader Mode'}`}
            </Button>
          </div>
        )}

        <SeoArticle />
      </main>

      <SiteFooter />
    </div>
  );
}
