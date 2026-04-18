// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          id: string
          nome: string
          status_curso: string
          turma: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          status_curso?: string
          turma?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          status_curso?: string
          turma?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'alunos_turma_fkey'
            columns: ['turma']
            isOneToOne: false
            referencedRelation: 'turmas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alunos_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      mensalidades_geradas: {
        Row: {
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          id: string
          mes_referencia: string
          status: string
          template_id: string
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          mes_referencia: string
          status?: string
          template_id: string
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          mes_referencia?: string
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'mensalidades_geradas_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'mensalidades_templates'
            referencedColumns: ['id']
          },
        ]
      }
      mensalidades_templates: {
        Row: {
          aluno_id: string
          created_at: string
          dia_vencimento: number
          id: string
          status_template: string
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          dia_vencimento: number
          id?: string
          status_template?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          dia_vencimento?: number
          id?: string
          status_template?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'mensalidades_templates_aluno_id_fkey'
            columns: ['aluno_id']
            isOneToOne: false
            referencedRelation: 'alunos'
            referencedColumns: ['id']
          },
        ]
      }
      pagamentos_confirmados: {
        Row: {
          created_at: string
          data_confirmacao: string
          id: string
          mensalidade_id: string
          metodo_confirmacao: string
        }
        Insert: {
          created_at?: string
          data_confirmacao?: string
          id?: string
          mensalidade_id: string
          metodo_confirmacao: string
        }
        Update: {
          created_at?: string
          data_confirmacao?: string
          id?: string
          mensalidade_id?: string
          metodo_confirmacao?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pagamentos_confirmados_mensalidade_id_fkey'
            columns: ['mensalidade_id']
            isOneToOne: false
            referencedRelation: 'mensalidades_geradas'
            referencedColumns: ['id']
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome_turma: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_turma: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_turma?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          senha_hash: string | null
          tipo_acesso: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          senha_hash?: string | null
          tipo_acesso: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          senha_hash?: string | null
          tipo_acesso?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: alunos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   nome: text (not null)
//   whatsapp: text (nullable)
//   turma: uuid (nullable)
//   status_curso: text (not null, default: 'ativo'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: mensalidades_geradas
//   id: uuid (not null, default: gen_random_uuid())
//   template_id: uuid (not null)
//   mes_referencia: text (not null)
//   data_vencimento: date (not null)
//   data_pagamento: date (nullable)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: mensalidades_templates
//   id: uuid (not null, default: gen_random_uuid())
//   aluno_id: uuid (not null)
//   valor: numeric (not null)
//   dia_vencimento: integer (not null)
//   status_template: text (not null, default: 'ativo'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: pagamentos_confirmados
//   id: uuid (not null, default: gen_random_uuid())
//   mensalidade_id: uuid (not null)
//   data_confirmacao: timestamp with time zone (not null, default: now())
//   metodo_confirmacao: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: turmas
//   id: uuid (not null, default: gen_random_uuid())
//   nome_turma: text (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   senha_hash: text (nullable)
//   tipo_acesso: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: alunos
//   PRIMARY KEY alunos_pkey: PRIMARY KEY (id)
//   CHECK alunos_status_curso_check: CHECK ((status_curso = ANY (ARRAY['ativo'::text, 'concluído'::text, 'cancelado'::text, 'suspenso'::text])))
//   FOREIGN KEY alunos_turma_fkey: FOREIGN KEY (turma) REFERENCES turmas(id) ON DELETE SET NULL
//   FOREIGN KEY alunos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: mensalidades_geradas
//   PRIMARY KEY mensalidades_geradas_pkey: PRIMARY KEY (id)
//   CHECK mensalidades_geradas_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'pago'::text, 'atrasado'::text])))
//   FOREIGN KEY mensalidades_geradas_template_id_fkey: FOREIGN KEY (template_id) REFERENCES mensalidades_templates(id) ON DELETE CASCADE
// Table: mensalidades_templates
//   FOREIGN KEY mensalidades_templates_aluno_id_fkey: FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
//   CHECK mensalidades_templates_dia_vencimento_check: CHECK (((dia_vencimento >= 1) AND (dia_vencimento <= 31)))
//   PRIMARY KEY mensalidades_templates_pkey: PRIMARY KEY (id)
//   CHECK mensalidades_templates_status_template_check: CHECK ((status_template = ANY (ARRAY['ativo'::text, 'inativo'::text])))
// Table: pagamentos_confirmados
//   FOREIGN KEY pagamentos_confirmados_mensalidade_id_fkey: FOREIGN KEY (mensalidade_id) REFERENCES mensalidades_geradas(id) ON DELETE CASCADE
//   CHECK pagamentos_confirmados_metodo_confirmacao_check: CHECK ((metodo_confirmacao = ANY (ARRAY['whatsapp'::text, 'comprovante'::text])))
//   PRIMARY KEY pagamentos_confirmados_pkey: PRIMARY KEY (id)
// Table: turmas
//   PRIMARY KEY turmas_pkey: PRIMARY KEY (id)
// Table: users
//   UNIQUE users_email_key: UNIQUE (email)
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
//   CHECK users_tipo_acesso_check: CHECK ((tipo_acesso = ANY (ARRAY['aluno'::text, 'financeiro'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: alunos
//   Policy "authenticated_delete_alunos" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_alunos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_alunos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_alunos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: mensalidades_geradas
//   Policy "authenticated_delete_mensalidades_geradas" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_mensalidades_geradas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_mensalidades_geradas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_mensalidades_geradas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: mensalidades_templates
//   Policy "authenticated_delete_mensalidades_templates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_mensalidades_templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_mensalidades_templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_mensalidades_templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: pagamentos_confirmados
//   Policy "authenticated_delete_pagamentos_confirmados" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_pagamentos_confirmados" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_pagamentos_confirmados" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_pagamentos_confirmados" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: turmas
//   Policy "authenticated_delete_turmas" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_turmas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_turmas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_turmas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: users
//   Policy "authenticated_delete_users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_tipo_acesso text;
//     v_nome text;
//     v_whatsapp text;
//     v_turma uuid;
//     v_aluno_id uuid;
//     v_template_id uuid;
//   BEGIN
//     v_tipo_acesso := COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'aluno');
//
//     INSERT INTO public.users (id, email, tipo_acesso)
//     VALUES (NEW.id, NEW.email, v_tipo_acesso)
//     ON CONFLICT (id) DO NOTHING;
//
//     IF v_tipo_acesso = 'aluno' THEN
//       v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Aluno Sem Nome');
//       v_whatsapp := NEW.raw_user_meta_data->>'whatsapp';
//
//       BEGIN
//         v_turma := (NEW.raw_user_meta_data->>'turma')::uuid;
//       EXCEPTION WHEN OTHERS THEN
//         v_turma := NULL;
//       END;
//
//       INSERT INTO public.alunos (user_id, nome, whatsapp, turma, status_curso)
//       VALUES (NEW.id, v_nome, v_whatsapp, v_turma, 'ativo')
//       RETURNING id INTO v_aluno_id;
//
//       -- Create dummy data to avoid empty states and show the app working
//       INSERT INTO public.mensalidades_templates (aluno_id, valor, dia_vencimento, status_template)
//       VALUES (v_aluno_id, 450.00, 10, 'ativo')
//       RETURNING id INTO v_template_id;
//
//       INSERT INTO public.mensalidades_geradas (template_id, mes_referencia, data_vencimento, data_pagamento, status)
//       VALUES
//         (v_template_id, '04/2026', '2026-04-10', NULL, 'pendente'),
//         (v_template_id, '03/2026', '2026-03-10', '2026-03-09', 'pago'),
//         (v_template_id, '02/2026', '2026-02-10', '2026-02-05', 'pago');
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: users
//   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
