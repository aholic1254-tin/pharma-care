"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, Package, ArrowRight, AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/shared/barcode-scanner";
import type { BarcodeMatch } from "@/lib/supabase/barcodes";

type LookupState = "idle" | "loading" | "found" | "not_found" | "error";

export function ScanClient() {
  const router = useRouter();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [match, setMatch] = useState<BarcodeMatch | null>(null);
  const [lastBarcode, setLastBarcode] = useState("");

  async function handleBarcode(barcode: string) {
    setScannerOpen(false);
    setLastBarcode(barcode);
    setLookupState("loading");
    setMatch(null);

    try {
      const res = await fetch(`/api/barcode?code=${encodeURIComponent(barcode)}`);
      if (res.ok) {
        const data: BarcodeMatch = await res.json();
        setMatch(data);
        setLookupState("found");
      } else if (res.status === 404) {
        setLookupState("not_found");
      } else {
        setLookupState("error");
      }
    } catch {
      setLookupState("error");
    }
  }

  function rescan() {
    setLookupState("idle");
    setMatch(null);
    setScannerOpen(true);
  }

  return (
    <div className="max-w-md">
      {/* Scan button */}
      <button
        onClick={() => setScannerOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/70 bg-primary/5 hover:bg-primary/10 transition-colors p-10 flex flex-col items-center gap-3 group"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
          <ScanLine className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <div className="font-semibold text-base">Tap to Scan</div>
          <div className="text-muted-foreground text-sm">Point camera at barcode or QR code</div>
        </div>
      </button>

      {/* Result area */}
      {lookupState !== "idle" && (
        <div className="mt-6 space-y-4">
          {lookupState === "loading" && (
            <div className="flex items-center gap-3 text-muted-foreground p-4 rounded-lg bg-muted/30">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Looking up barcode…</span>
            </div>
          )}

          {lookupState === "found" && match && (
            <div className="rounded-xl border border-border bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base">{match.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="font-mono text-xs">{match.drug_code}</Badge>
                    <span className="text-muted-foreground text-xs">{match.drug_forms?.name}</span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">Unit: {match.unit}</div>
                </div>
              </div>

              <div className="font-mono text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5 break-all">
                {lastBarcode}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => router.push(`/receive?drug_id=${match.drug_id}`)}
                  className="w-full"
                >
                  Receive <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dispense?drug_id=${match.drug_id}`)}
                  className="w-full"
                >
                  Dispense <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={rescan} className="w-full text-muted-foreground">
                Scan another
              </Button>
            </div>
          )}

          {lookupState === "not_found" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Barcode not registered</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground bg-white/60 rounded px-3 py-1.5 break-all">
                {lastBarcode}
              </div>
              <p className="text-sm text-amber-700">
                This barcode is not linked to any medicine. Add it in the Medicine Master.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={rescan}>Scan again</Button>
                <Button size="sm" onClick={() => router.push("/medicines")}>
                  <Plus className="w-4 h-4 mr-1" /> Medicine Master
                </Button>
              </div>
            </div>
          )}

          {lookupState === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Lookup failed</span>
              </div>
              <p className="text-sm text-red-700">Could not connect to the server. Check your connection.</p>
              <Button size="sm" variant="outline" onClick={rescan}>Try again</Button>
            </div>
          )}
        </div>
      )}

      {scannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcode}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
