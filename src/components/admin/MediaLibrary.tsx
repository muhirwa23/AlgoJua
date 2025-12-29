import type * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Trash2, Edit2, Copy, Check, X, Image as ImageIcon, Search } from "lucide-react";
import { toast } from "sonner";
import type { MediaItem } from "@/lib/media";

interface MediaLibraryProps {
  media: MediaItem[];
  onUpload: (file: File, metadata?: { alt_text?: string; caption?: string }) => Promise<void>;
  onUpdate: (id: string, updates: { alt_text?: string; caption?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSearch?: (query: string) => Promise<void>;
}

export function MediaLibrary({ media, onUpload, onUpdate, onDelete, onSearch }: MediaLibraryProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({ alt_text: "", caption: "" });
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setIsDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile, uploadMetadata);
      toast.success("Media uploaded successfully!");
      setSelectedFile(null);
      setUploadMetadata({ alt_text: "", caption: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to upload media");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await onUpdate(editingItem.id, {
        alt_text: editingItem.alt_text,
        caption: editingItem.caption,
      });
      toast.success("Media updated");
      setEditingItem(null);
    } catch (error) {
      toast.error("Failed to update media");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this media? This action cannot be undone.")) {
      try {
        await onDelete(id);
        toast.success("Media deleted");
      } catch (error) {
        toast.error("Failed to delete media");
      }
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearch = async () => {
    if (onSearch && searchQuery.trim()) {
      await onSearch(searchQuery.trim());
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search media by filename, alt text, or caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="bg-slate-900 border-slate-700 pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        </div>
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Upload New Media</DialogTitle>
              <DialogDescription>Add a new image to your media library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image File</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="bg-slate-950 border-slate-700"
                />
                {selectedFile && (
                  <p className="text-sm text-slate-400">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={uploadMetadata.alt_text}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, alt_text: e.target.value })}
                  placeholder="Descriptive alt text for accessibility"
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={uploadMetadata.caption}
                  onChange={(e) => setUploadMetadata({ ...uploadMetadata, caption: e.target.value })}
                  placeholder="Optional caption"
                  rows={3}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {media.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No media yet. Upload your first image!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => (
            <Card key={item.id} className="border-slate-800 bg-slate-900/50 overflow-hidden group">
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={item.url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    onClick={() => copyUrl(item.url, item.id)}
                    variant="secondary"
                    size="sm"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setEditingItem(item)}
                    variant="secondary"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {item.width && item.height ? `${item.width}x${item.height}` : "Unknown"}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatFileSize(item.file_size)}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{item.filename}</p>
                  {item.alt_text && (
                    <p className="text-xs text-slate-400 line-clamp-2">{item.alt_text}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle>Edit Media</DialogTitle>
              <DialogDescription>Update alt text and caption</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
                <img
                  src={editingItem.url}
                  alt={editingItem.alt_text || editingItem.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={editingItem.alt_text || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, alt_text: e.target.value })}
                  placeholder="Descriptive alt text"
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={editingItem.caption || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  placeholder="Optional caption"
                  rows={3}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  Save Changes
                </Button>
                <Button onClick={() => setEditingItem(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
