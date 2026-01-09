import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Save, X, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/categories";

interface CategoriesManagerProps {
  categories: Category[];
  forceShowAdd?: number;
  onSave: (category: { name: string; slug: string; description: string; color: string; icon: string }) => Promise<void>;
  onUpdate: (id: string, category: Partial<{ name: string; slug: string; description: string; color: string; icon: string }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoriesManager({ categories, forceShowAdd = 0, onSave, onUpdate, onDelete }: CategoriesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (forceShowAdd > 0) {
      setShowAddForm(true);
      // Scroll to form if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [forceShowAdd]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#3b82f6",
    icon: "",
  });
  const [editData, setEditData] = useState<Category | null>(null);

  const handleAdd = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      await onSave(formData);
      setFormData({ name: "", slug: "", description: "", color: "#3b82f6", icon: "" });
      setShowAddForm(false);
      toast.success("Category created");
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditData(category);
  };

  const handleUpdate = async () => {
    if (!editData || !editingId) return;

    try {
      await onUpdate(editingId, editData);
      setEditingId(null);
      setEditData(null);
      toast.success("Category updated");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? Posts using this category will need to be updated.")) {
      try {
        await onDelete(id);
        toast.success("Category deleted");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Categories</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tech News"
                  className="bg-slate-900 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tech-news"
                  className="bg-slate-900 border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Latest tech news and updates"
                className="bg-slate-900 border-slate-700"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="bg-slate-900 border-slate-700 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📰"
                  className="bg-slate-900 border-slate-700"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              {editingId === category.id && editData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Input
                      value={editData.slug}
                      onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <Textarea
                    value={editData.description || ""}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="color"
                      value={editData.color}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                    />
                    <Input
                      value={editData.icon || ""}
                      onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => {setEditingId(null); setEditData(null);}} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-sm text-slate-400">{category.slug}</div>
                      {category.description && (
                        <div className="text-sm text-slate-500 mt-1">{category.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(category)} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(category.id)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
