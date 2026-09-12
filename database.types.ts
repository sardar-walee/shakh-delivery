/**
 * Supabase database types.
 * The canonical schema lives in supabase/migrations/00000_production_rebuild.sql.
 * Keep this lightweight map in sync when adding strongly typed tables.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      [table: string]: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships?: any[];
      };
    };
    Views: { [view: string]: any };
    Functions: { [fn: string]: any };
    Enums: { [name: string]: any };
    CompositeTypes: { [name: string]: any };
  };
}
