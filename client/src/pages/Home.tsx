import { useEffect, useMemo, useRef, useState } from "react";
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
import { Download, Plus, Link as LinkIcon, FileText, Loader2, X, Settings, Check } from "lucide-react";
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
import type { WorkImportProgress } from "@/lib/importer/workImporter";
import { parseConverterHandoff } from "@/lib/converterHandoff";
import {
  appendUniqueChapter,
  BINDER_DEFAULTS,
  clearBinderSnapshot,
  collectSourceUrls,
  getRemainingChapters,
  loadBinderSnapshot,
  saveBinderSnapshot,
  serializeBinder,
  type PersistedWorkImport,
} from "@/lib/persistence/binderStore";
import { isAo3WorkUrl } from "@/lib/sources/ao3";
import type { ChapterRef, WorkManifest } from "@/lib/sources/types";

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
    coverMimeType,
    handleCoverUpload,
    handleRemoveCover,
    restoreCoverImage,
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
  const [bookTitle, setBookTitle] = useState<string>(BINDER_DEFAULTS.bookTitle);
  const [authorName, setAuthorName] = useState<string>(BINDER_DEFAULTS.authorName);

  // Formatting State
  const [font, setFont] = useState<string>(BINDER_DEFAULTS.font);
  const [spacing, setSpacing] = useState<string>(BINDER_DEFAULTS.spacing);
  const [dropCaps, setDropCaps] = useState<boolean>(BINDER_DEFAULTS.dropCaps);
  const [outputFormat, setOutputFormat] = useState<"epub" | "reader">(BINDER_DEFAULTS.outputFormat);

  const [isMultiChapter, setIsMultiChapter] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<{ current: number; total: string }>({ current: 0, total: "?" });
  const [isFetchingSequence, setIsFetchingSequence] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const trimmedUrlInput = urlInput.trim();
  const isAo3Url = isAo3WorkUrl(trimmedUrlInput);

  // AO3 whole-work import state
  const [ao3Manifest, setAo3Manifest] = useState<WorkManifest | null>(null);
  const [isAo3PreviewLoading, setIsAo3PreviewLoading] = useState(false);
  const [isImportingWork, setIsImportingWork] = useState(false);
  const [workProgress, setWorkProgress] = useState<WorkImportProgress | null>(null);
  const [workController, setWorkController] = useState<AbortController | null>(null);
  const canFetchUrl = isLikelyValidUrl(trimmedUrlInput) && !isLoading && !isFetchingSequence && !isImportingWork;

  // Accept handed-off URLs from guide pages (/?url=…) exactly once per load.
  useEffect(() => {
    const handed = parseConverterHandoff(window.location.search);
    if (handed) setUrlInput(handed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local persistence (IndexedDB, this device only).
  const [isBinderReady, setIsBinderReady] = useState(false);
  const [persistenceBlocked, setPersistenceBlocked] = useState(false);
  const [resumableImport, setResumableImport] = useState<PersistedWorkImport | null>(null);
  const persistenceNoticeShown = useRef(false);

  const notifyPersistenceUnavailable = (reason: string) => {
    if (persistenceNoticeShown.current) return;
    persistenceNoticeShown.current = true;
    toast({
      title: "Local Autosave Unavailable",
      description: `${reason} The binder still works, but it will not be restored after reload.`,
      variant: "default",
    });
  };

  // Restore a previously autosaved binder exactly once per load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadBinderSnapshot();
      if (cancelled) return;
      if (!loaded.ok) {
        notifyPersistenceUnavailable(loaded.reason);
        setIsBinderReady(true);
        return;
      }
      const snapshot = loaded.snapshot;
      if (loaded.newerVersion) {
        // A newer app version wrote this data; don't overwrite it.
        setPersistenceBlocked(true);
        toast({
          title: "Binder Left Untouched",
          description: "This device holds binder data from a newer app version. Autosave is paused to protect it.",
          variant: "default",
        });
        setIsBinderReady(true);
        return;
      }
      if (snapshot && (snapshot.chapters.length > 0 || snapshot.ao3Import)) {
        setChapters(snapshot.chapters);
        setBookTitle(snapshot.bookTitle);
        setAuthorName(snapshot.authorName);
        setFont(snapshot.font);
        setSpacing(snapshot.spacing);
        setDropCaps(snapshot.dropCaps);
        setOutputFormat(snapshot.outputFormat);
        if (snapshot.cover) {
          try {
            restoreCoverImage(snapshot.cover.data, snapshot.cover.mimeType);
          } catch {
            // A corrupt cover must not block the rest of the restore.
          }
        }
        if (snapshot.ao3Import) {
          const remaining = getRemainingChapters(
            snapshot.ao3Import.manifest,
            collectSourceUrls(snapshot.chapters),
          );
          if (remaining.length > 0) {
            setResumableImport(snapshot.ao3Import);
            toast({
              title: "Binder Restored",
              description: `${snapshot.chapters.length} chapter${snapshot.chapters.length === 1 ? "" : "s"} restored. An interrupted AO3 import (${remaining.length} remaining) can be resumed below.`,
            });
          } else {
            toast({
              title: "Binder Restored",
              description: `${snapshot.chapters.length} chapter${snapshot.chapters.length === 1 ? "" : "s"} restored from this device.`,
            });
          }
        } else {
          toast({
            title: "Binder Restored",
            description: `${snapshot.chapters.length} chapter${snapshot.chapters.length === 1 ? "" : "s"} restored from this device.`,
          });
        }
      }
      setIsBinderReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced autosave of binder state, cover, formatting, and work-import progress.
  useEffect(() => {
    if (!isBinderReady || persistenceBlocked) return;
    const timer = setTimeout(() => {
      const snapshot = serializeBinder({
        bookTitle,
        authorName,
        font,
        spacing,
        dropCaps,
        outputFormat,
        coverImage,
        coverMimeType,
        chapters,
        ao3Import: resumableImport ?? (ao3Manifest
          ? {
            workUrl: ao3Manifest.metadata.sourceUrl || trimmedUrlInput,
            manifest: ao3Manifest,
            status: "in-progress" as const,
          }
          : null),
      });
      void saveBinderSnapshot(snapshot).then((result) => {
        if (!result.ok) notifyPersistenceUnavailable(result.reason);
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [
    isBinderReady,
    persistenceBlocked,
    chapters,
    bookTitle,
    authorName,
    font,
    spacing,
    dropCaps,
    outputFormat,
    coverImage,
    coverMimeType,
    ao3Manifest,
    resumableImport,
    trimmedUrlInput,
  ]);
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
        sourceUrl: trimmedUrlInput,
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
          sourceUrl: currentUrl,
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

  const handlePreviewAo3Work = async () => {
    if (!canFetchUrl || !isAo3Url || isAo3PreviewLoading || isImportingWork) return;

    setIsAo3PreviewLoading(true);
    setToolStatus("Detecting AO3 work...");
    try {
      const { fetchViaFirstPartyProxy, fetchAo3WorkManifest } = await import("@/lib/epub");
      const manifest = await fetchAo3WorkManifest(trimmedUrlInput, fetchViaFirstPartyProxy);
      setAo3Manifest(manifest);
      toast({
        title: "AO3 Work Detected",
        description: `"${manifest.metadata.title}" by ${manifest.metadata.author} — ${manifest.chapters.length} chapter${manifest.chapters.length === 1 ? "" : "s"}.`,
      });
    } catch (error) {
      setAo3Manifest(null);
      toast({
        title: "AO3 Detection Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setToolStatus(null);
      setIsAo3PreviewLoading(false);
    }
  };

  const handleImportAo3Work = async () => {
    if (!ao3Manifest || isImportingWork) return;

    const controller = new AbortController();
    setWorkController(controller);
    setIsImportingWork(true);
    setResumableImport(null);
    setWorkProgress({ completed: 0, total: ao3Manifest.chapters.length, currentTitle: "Starting…", currentUrl: "" });
    setToolStatus("Importing AO3 work...");

    try {
      const { fetchViaFirstPartyProxy, importAo3WorkChapters } = await import("@/lib/epub");
      const existingUrls = collectSourceUrls(chapters);
      const outcome = await importAo3WorkChapters(ao3Manifest, fetchViaFirstPartyProxy, {
        signal: controller.signal,
        existingUrls,
        onProgress: (progress) => setWorkProgress(progress),
        // Append each chapter as it arrives (stable source-URL dedupe) so a
        // reload mid-import keeps everything imported so far.
        onChapter: (item) => {
          const wordCount = countWords(item.content);
          setChapters((prev) => appendUniqueChapter(prev, { ...item, wordCount }).chapters);
        },
      });

      if (outcome.cancelled) {
        toast({
          title: "Import Stopped",
          description: outcome.imported.length > 0
            ? `Kept ${outcome.imported.length} imported chapter${outcome.imported.length === 1 ? "" : "s"}.`
            : "Import cancelled before any chapters were added.",
        });
      } else if (outcome.failed.length === 0) {
        toast({
          title: "Work Import Complete",
          description: `Added ${outcome.imported.length} of ${ao3Manifest.chapters.length} chapters.`,
        });
        setUrlInput("");
        setAo3Manifest(null);
      } else {
        toast({
          title: outcome.imported.length > 0 ? "Import Partially Complete" : "Import Failed",
          description: `Added ${outcome.imported.length} of ${ao3Manifest.chapters.length} chapters. ${outcome.failed.length} failed (first: ${outcome.failed[0].title} — ${outcome.failed[0].error}). Already-imported chapters were kept.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        toast({
          title: "Work Import Failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    } finally {
      setToolStatus(null);
      setIsImportingWork(false);
      setWorkController(null);
      setWorkProgress(null);
    }
  };

  const cancelWorkImport = () => {
    workController?.abort();
  };

  const applyAo3Metadata = () => {
    if (!ao3Manifest) return;
    setBookTitle(ao3Manifest.metadata.title);
    setAuthorName(ao3Manifest.metadata.author);
    toast({
      title: "Metadata Applied",
      description: "Book title and author were set from the AO3 work.",
    });
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

  const handleResumeImport = () => {
    if (!resumableImport || isImportingWork) return;
    setUrlInput(resumableImport.workUrl);
    setAo3Manifest(resumableImport.manifest);
    setResumableImport(null);
    toast({
      title: "Import Ready to Resume",
      description: "Press “Import All” to fetch the remaining chapters. Completed chapters will be skipped.",
    });
  };

  const handleDiscardResumableImport = () => {
    setResumableImport(null);
    toast({
      title: "Interrupted Import Discarded",
      description: "Already-restored chapters were kept in the binder.",
    });
  };

  const handleClearBinder = () => {
    if (chapters.length === 0 && !ao3Manifest && !resumableImport) return;
    const confirmed = window.confirm(
      "Start a new binder? This removes all chapters and any interrupted import from this device. This cannot be undone.",
    );
    if (!confirmed) return;
    setChapters([]);
    setAo3Manifest(null);
    setResumableImport(null);
    void clearBinderSnapshot();
    toast({
      title: "New Binder Started",
      description: "All chapters and saved import progress were cleared from this device.",
    });
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
        <section className="mb-6 text-center w-full mx-auto max-w-3xl space-y-3" aria-labelledby="home-heading">
          <h1 id="home-heading" className="text-3xl md:text-4xl font-bold tracking-tight font-serif text-foreground">
            Convert Fanfiction & Web Fiction to EPUB
          </h1>
          <p className="text-base text-foreground/90">
            Paste a story or chapter URL to build an EPUB or Reader Mode HTML file for Kindle, Kobo, Apple Books, or offline reading.
          </p>
          <p className="text-sm text-muted-foreground">
            Your binder and exports are generated locally on your device. No account required.
          </p>
        </section>

        {resumableImport && !isImportingWork && (
          <section
            className="mb-6 mx-auto max-w-3xl rounded-lg border border-border bg-card/50 p-4 space-y-3"
            aria-live="polite"
            aria-label="Interrupted import"
          >
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Interrupted AO3 import found on this device</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                “{resumableImport.manifest.metadata.title}” by {resumableImport.manifest.metadata.author} —{" "}
                {getRemainingChapters(resumableImport.manifest, collectSourceUrls(chapters)).length} of{" "}
                {resumableImport.manifest.chapters.length} chapters still missing. Completed chapters are already in
                the binder and will be skipped.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleResumeImport}
              >
                <Download className="mr-2 h-4 w-4" />
                Resume Import
              </Button>
              <Button type="button" variant="ghost" onClick={handleDiscardResumableImport}>
                Discard
              </Button>
            </div>
          </section>
        )}

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
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            if (ao3Manifest) setAo3Manifest(null);
                          }}
                          className="bg-input border-border text-foreground"
                          aria-invalid={trimmedUrlInput.length > 0 && !isLikelyValidUrl(trimmedUrlInput)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground" aria-live="polite">
                        {trimmedUrlInput.length > 0 && !isLikelyValidUrl(trimmedUrlInput)
                          ? "Enter a full URL starting with http:// or https://."
                          : "Best with AO3, RoyalRoad, and readable article pages. Wattpad usually needs manual entry."}
                      </p>
                      <ul className="grid gap-1 text-xs text-muted-foreground" aria-label="Supported workflows">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          AO3 whole-work import with chapter preview
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          Readable web pages via URL Fetcher
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          Manual entry when a source blocks fetching
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          No account required — exports stay on your device
                        </li>
                      </ul>
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

                      {isAo3Url && (
                        <div className="rounded-md border border-border bg-secondary/10 p-3 space-y-3" aria-live="polite">
                          <p className="text-xs font-medium text-foreground">
                            AO3 whole-work import is available for this URL. Preview the work, then import all chapters in order.
                          </p>
                          {!ao3Manifest ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full"
                              onClick={handlePreviewAo3Work}
                              disabled={!canFetchUrl || isAo3PreviewLoading}
                            >
                              {isAo3PreviewLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Detecting chapters...
                                </>
                              ) : (
                                "Detect AO3 Chapters"
                              )}
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-xs text-foreground">
                                <p className="font-bold font-serif text-sm break-words">{ao3Manifest.metadata.title}</p>
                                <p className="text-muted-foreground break-words">by {ao3Manifest.metadata.author}</p>
                                <p className="text-muted-foreground">
                                  {ao3Manifest.chapters.length} chapter{ao3Manifest.chapters.length === 1 ? "" : "s"} detected
                                </p>
                              </div>
                              <div className="max-h-32 overflow-y-auto rounded border border-border bg-card p-2 text-xs text-muted-foreground">
                                <ol className="list-decimal pl-5 space-y-1">
                                  {ao3Manifest.chapters.slice(0, 30).map((chapter: ChapterRef) => (
                                    <li key={chapter.id} className="break-words">{chapter.title}</li>
                                  ))}
                                </ol>
                                {ao3Manifest.chapters.length > 30 && (
                                  <p className="mt-1">…and {ao3Manifest.chapters.length - 30} more</p>
                                )}
                              </div>
                              {workProgress && (
                                <p className="text-xs text-muted-foreground">
                                  Importing {workProgress.completed} of {workProgress.total}: {workProgress.currentTitle}
                                </p>
                              )}
                              <div className="flex flex-col gap-2">
                                {isImportingWork ? (
                                  <Button type="button" variant="destructive" className="w-full" onClick={cancelWorkImport}>
                                    <X className="mr-2 h-4 w-4" />
                                    Stop Import{workProgress ? ` (${workProgress.completed}/${workProgress.total})` : ""}
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={handleImportAo3Work}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Import All {ao3Manifest.chapters.length} Chapters
                                  </Button>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={applyAo3Metadata}
                                    disabled={isImportingWork}
                                  >
                                    Use Title & Author
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setAo3Manifest(null)}
                                    disabled={isImportingWork}
                                  >
                                    Clear Preview
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
            onClearChapters={handleClearBinder}
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
