-- =============================================
-- ReservaFácil — Supabase Schema
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. PERFIS DE USUÁRIO (complementa auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  papel       TEXT NOT NULL DEFAULT 'funcionario' CHECK (papel IN ('admin','funcionario','cliente')),
  telefone    TEXT,                    -- usado para notificação WhatsApp
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: cria profile automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, papel)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'papel', 'funcionario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SALAS
CREATE TABLE public.salas (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  capacidade  INT NOT NULL DEFAULT 8,
  recursos    TEXT[] DEFAULT '{}',     -- ex: ["Projetor","Wi-Fi"]
  ativa       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESERVAS
CREATE TABLE public.reservas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT NOT NULL CHECK (tipo IN ('sala','carro')),
  sala_id     INT REFERENCES public.salas(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data        DATE NOT NULL,
  inicio      TIME NOT NULL,
  fim         TIME NOT NULL,
  motivo      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmado'
                CHECK (status IN ('confirmado','pendente','cancelado')),
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- impede dupla reserva do mesmo recurso no mesmo horário
  CONSTRAINT sem_conflito_sala EXCLUDE USING gist (
    sala_id WITH =,
    data WITH =,
    tsrange(
      (data + inicio)::TIMESTAMP,
      (data + fim)::TIMESTAMP
    ) WITH &&
  ) WHERE (tipo = 'sala' AND status != 'cancelado'),

  CONSTRAINT sem_conflito_carro EXCLUDE USING gist (
    data WITH =,
    tsrange(
      (data + inicio)::TIMESTAMP,
      (data + fim)::TIMESTAMP
    ) WITH &&
  ) WHERE (tipo = 'carro' AND status != 'cancelado')
);

-- Extensão necessária para EXCLUDE USING gist com tsrange
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas  ENABLE ROW LEVEL SECURITY;

-- profiles: usuário vê o próprio, admin vê todos
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- salas: todos autenticados leem; só admin modifica
CREATE POLICY "salas_select_auth" ON public.salas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "salas_write_admin" ON public.salas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

-- reservas: usuário vê/cria as próprias; admin vê todas
CREATE POLICY "reservas_select_own" ON public.reservas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "reservas_select_admin" ON public.reservas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "reservas_insert_auth" ON public.reservas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reservas_update_own" ON public.reservas
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "reservas_update_admin" ON public.reservas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "reservas_delete_own" ON public.reservas
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "reservas_delete_admin" ON public.reservas
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

-- =============================================
-- SEED — dados iniciais
-- =============================================

INSERT INTO public.salas (nome, capacidade, recursos) VALUES
  ('Sala Alfa',    8,  ARRAY['Projetor','Wi-Fi','Ar-condicionado']),
  ('Sala Beta',   12,  ARRAY['TV 65"','Wi-Fi','Lousa']),
  ('Sala Gama',    4,  ARRAY['Wi-Fi','Mesa redonda']),
  ('Sala Delta',  20,  ARRAY['Projetor','Wi-Fi','Teleconferência']),
  ('Sala Épsilon', 6,  ARRAY['TV 50"','Wi-Fi']),
  ('Auditório',   50,  ARRAY['Projetor','Microfone','Wi-Fi','Ar-condicionado']);
