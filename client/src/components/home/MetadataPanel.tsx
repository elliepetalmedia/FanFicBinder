import { Image as ImageIcon, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MetadataPanelProps {
  bookTitle: string;
  authorName: string;
  coverPreview: string | null;
  onBookTitleChange: (value: string) => void;
  onAuthorNameChange: (value: string) => void;
  onCoverUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
}

export function MetadataPanel({
  bookTitle,
  authorName,
  coverPreview,
  onBookTitleChange,
  onAuthorNameChange,
  onCoverUpload,
  onRemoveCover,
}: MetadataPanelProps) {
  return (
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
            onChange={(event) => onBookTitleChange(event.target.value)}
            className="bg-input border-border font-serif font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author-name">Author</Label>
          <Input
            id="author-name"
            value={authorName}
            onChange={(event) => onAuthorNameChange(event.target.value)}
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2 pt-2">
          <Label>Cover Image</Label>
          {coverPreview ? (
            <div className="relative aspect-[2/3] w-32 mx-auto group rounded-lg overflow-hidden border border-border shadow-sm">
              <img
                src={coverPreview}
                alt="Book Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onRemoveCover}
                  className="h-8 w-8"
                  aria-label="Remove cover image"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/5 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={onCoverUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Upload cover image"
              />
              <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span className="text-xs">Upload Cover</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
