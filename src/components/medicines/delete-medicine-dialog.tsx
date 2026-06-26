"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DrugWithForm } from "@/lib/supabase/medicines";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drug: DrugWithForm | null;
  onSuccess: () => void;
}

export function DeleteMedicineDialog({ open, onOpenChange, drug, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!drug) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("drugs").delete().eq("id", drug.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Medicine deleted");
      onOpenChange(false);
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Medicine</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {drug?.name}
            </span>
            ? This cannot be undone. Medicines with existing inventory or
            transactions cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
