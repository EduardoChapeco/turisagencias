const fs = require('fs');

const filePath = 'c:/Users/aline/Music/turisagencias/src/integrations/supabase/types.ts';
let content = fs.readFileSync(filePath, 'utf8');

const tableInsertPoint = '    Tables: {';
const insertIdx = content.indexOf(tableInsertPoint);

if (insertIdx === -1) {
  console.error('Tables: { not found in types.ts');
  process.exit(1);
}

const injection = `
      public_sites: {
        Row: {
          id: string
          org_id: string
          slug: string
          domain: string | null
          status: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          slug: string
          domain?: string | null
          status?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          slug?: string
          domain?: string | null
          status?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_sites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      builder_projects: {
        Row: {
          id: string
          org_id: string
          site_id: string | null
          project_type: string
          title: string
          current_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          site_id?: string | null
          project_type: string
          title: string
          current_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          site_id?: string | null
          project_type?: string
          title?: string
          current_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "public_sites"
            referencedColumns: ["id"]
          }
        ]
      }
      builder_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          frame_schema: any
          content_schema: any
          design_tokens: any
          render_snapshot: any | null
          status: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          frame_schema: any
          content_schema: any
          design_tokens: any
          render_snapshot?: any | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          frame_schema?: any
          content_schema?: any
          design_tokens?: any
          render_snapshot?: any | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      airline_checkin_registry: {
        Row: {
          id: string
          airline_iata: string
          airline_name: string
          landing_url: string
          deep_link_template: string | null
          required_fields: any
          supports_prefill: boolean
          notes: string | null
          source_url: string | null
          verified_at: string | null
          status: string
        }
        Insert: {
          id?: string
          airline_iata: string
          airline_name: string
          landing_url: string
          deep_link_template?: string | null
          required_fields?: any
          supports_prefill?: boolean
          notes?: string | null
          source_url?: string | null
          verified_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          airline_iata?: string
          airline_name?: string
          landing_url?: string
          deep_link_template?: string | null
          required_fields?: any
          supports_prefill?: boolean
          notes?: string | null
          source_url?: string | null
          verified_at?: string | null
          status?: string
        }
        Relationships: []
      }
`;

content = content.slice(0, insertIdx + tableInsertPoint.length) + injection + content.slice(insertIdx + tableInsertPoint.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected new types into integrations/supabase/types.ts!');
