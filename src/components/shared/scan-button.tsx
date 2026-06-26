"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/shared/barcode-scanner";
import { toast } from "sonner";
import type { BarcodeMatch } from "@/lib/supabase/barcodes";

interface Props {
  onMatch: (match: BarcodeMatch) => void;
  size?: "sm" | "default";
}

export function ScanButton({ onMatch, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBarcode(barcode: string) {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`);
      if (res.ok) {
        const data: BarcodeMatch = await res.json();
        onMatch(data);
        toast.success(`Found: ${data.name}`);
      } else if (res.status === 404) {
        toast.error("Barcode not registered. Add it in Medicine Master.");
      } else {
        toast.error("Barcode lookup failed.");
      }
    } catch {
      toast.error("Network error during barcode lookup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={loading}
        title="Scan barcode"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
        <span className="ml-1.5 hidden sm:inline">Scan</span>
      </Button>

      {open && (
        <BarcodeScanner
          onDetected={handleBarcode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
