"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { X, Camera, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

type ScanState = "requesting" | "scanning" | "error";

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [state, setState] = useState<ScanState>("requesting");
  const [errorMsg, setErrorMsg] = useState("");
  const lastResult = useRef("");

  const handleResult = useCallback((barcode: string) => {
    // Debounce: ignore duplicate reads within same scan session
    if (barcode === lastResult.current) return;
    lastResult.current = barcode;
    onDetected(barcode);
  }, [onDetected]);

  useEffect(() => {
    let stopped = false;

    async function start() {
      try {
        // Check camera permission
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) return;

        setState("scanning");
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        if (!videoRef.current) return;

        await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (stopped) return;
            if (result) {
              handleResult(result.getText());
            } else if (err && !(err instanceof NotFoundException)) {
              console.warn("ZXing decode error:", err);
            }
          }
        );
      } catch (err) {
        if (stopped) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          setErrorMsg("Camera permission denied. Please allow camera access and try again.");
        } else if (msg.includes("NotFound") || msg.includes("Devices")) {
          setErrorMsg("No camera found on this device.");
        } else {
          setErrorMsg(`Camera error: ${msg}`);
        }
        setState("error");
      }
    }

    start();

    return () => {
      stopped = true;
      if (readerRef.current) {
        // Stop all tracks
        BrowserMultiFormatReader.releaseAllStreams();
        readerRef.current = null;
      }
    };
  }, [handleResult]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Scan Barcode</span>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scanner area */}
        <div className="relative bg-black aspect-square flex items-center justify-center">
          {state === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-10">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Requesting camera…</span>
            </div>
          )}

          {state === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-10 p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span className="text-sm">{errorMsg}</span>
            </div>
          )}

          {/* Video element always rendered so ref is set before useEffect runs */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${state !== "scanning" ? "opacity-0" : ""}`}
            autoPlay
            muted
            playsInline
          />

          {/* Scan guide overlay */}
          {state === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Corner brackets */}
              <div className="relative w-48 h-36">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
                {/* Scan line animation */}
                <div className="absolute left-1 right-1 h-0.5 bg-green-400 opacity-80 animate-scan-line" />
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 text-center">
          {state === "scanning" ? (
            <p className="text-xs text-muted-foreground">Point camera at barcode or QR code</p>
          ) : state === "error" ? (
            <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
