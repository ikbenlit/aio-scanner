-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.scan_modules (
  scan_id bigint NOT NULL,
  module_name text NOT NULL,
  status text DEFAULT 'waiting'::text,
  score integer,
  findings jsonb,
  progress integer DEFAULT 0,
  completed_at timestamp with time zone,
  CONSTRAINT scan_modules_pkey PRIMARY KEY (scan_id, module_name),
  CONSTRAINT scan_modules_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scans(id)
);
CREATE TABLE public.scan_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  scan_id bigint NOT NULL,
  tier text NOT NULL CHECK (tier = ANY (ARRAY['starter'::text, 'business'::text, 'enterprise'::text])),
  amount numeric NOT NULL,
  mollie_payment_id text UNIQUE,
  user_email text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT scan_payments_pkey PRIMARY KEY (id),
  CONSTRAINT scan_payments_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scans(id)
);
CREATE TABLE public.scans (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint,
  url text NOT NULL,
  status text DEFAULT 'pending'::text,
  overall_score integer,
  result_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  email_sent boolean DEFAULT false,
  email_sent_at timestamp without time zone,
  email_template_version text,
  progress integer DEFAULT 0,
  email_captured text,
  email_captured_at timestamp with time zone,
  enforcement_key text,
  email character varying,
  email_error text,
  email_message_id character varying,
  screenshot text,
  tier text DEFAULT 'basic'::text CHECK (tier = ANY (ARRAY['basic'::text, 'starter'::text, 'business'::text, 'enterprise'::text])),
  payment_reference text,
  user_email text,
  CONSTRAINT scans_pkey PRIMARY KEY (id),
  CONSTRAINT scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_scan_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  scan_ids ARRAY DEFAULT ARRAY[]::bigint[],
  first_scan_at timestamp with time zone DEFAULT now(),
  last_scan_at timestamp with time zone DEFAULT now(),
  total_scans integer DEFAULT 0,
  paid_scans integer DEFAULT 0,
  total_spent numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_scan_history_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  plan_type text DEFAULT 'free'::text,
  credits_balance integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);