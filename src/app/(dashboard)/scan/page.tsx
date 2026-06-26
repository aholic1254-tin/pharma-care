import { ScanClient } from "@/components/scan/scan-client";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Barcode Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scan a medicine barcode to quickly look up or record a transaction.
        </p>
      </div>
      <ScanClient />
    </div>
  );
}
