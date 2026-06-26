// Auto-maintained Supabase table types — keep in sync with migrations.

export type Database = {
  public: {
    Tables: {
      drug_forms: {
        Row: {
          id: number;
          name: string;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["drug_forms"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["drug_forms"]["Insert"]>;
      };
      suppliers: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: { name: string };
        Update: { name?: string };
      };
      package_types: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: { name: string };
        Update: { name?: string };
      };
      drugs: {
        Row: {
          id: number;
          drug_id: string;
          name: string;
          drug_form_id: number;
          unit: string;
          minimum_stock: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["drugs"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["drugs"]["Insert"]
        >;
      };
      lots: {
        Row: {
          id: number;
          drug_id: number;
          lot_code: string;
          receive_date: string;
          expiry_date: string;
          remaining_quantity: number;
          unit_price: number;
          supplier_id: number | null;
          package_type_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["lots"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["lots"]["Insert"]
        >;
      };
      receive_transactions: {
        Row: {
          id: number;
          drug_id: number;
          lot_id: number;
          receive_date: string;
          lot_code: string;
          quantity: number;
          expiry_date: string;
          unit_price: number;
          package_type_id: number | null;
          supplier_id: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["receive_transactions"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["receive_transactions"]["Insert"]
        >;
      };
      dispense_transactions: {
        Row: {
          id: number;
          drug_id: number;
          lot_id: number;
          dispense_date: string;
          quantity: number;
          patient_name: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["dispense_transactions"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["dispense_transactions"]["Insert"]
        >;
      };
      drug_barcodes: {
        Row: {
          id: number;
          barcode: string;
          drug_id: number;
          note: string | null;
          created_at: string;
        };
        Insert: { barcode: string; drug_id: number; note?: string | null };
        Update: { barcode?: string; drug_id?: number; note?: string | null };
      };
    };
  };
};
