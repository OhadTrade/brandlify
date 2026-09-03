-- =============================================================================
-- Brandlify — close the RPC route on the trigger function
--
-- Supabase's security advisor flagged public.set_updated_at(): living in the
-- `public` schema it was reachable as POST /rest/v1/rpc/set_updated_at by both
-- anon and authenticated, and SECURITY DEFINER meant it would have run with the
-- owner's rights.
--
-- It only ever touches NEW, so it needs no elevated rights. SECURITY INVOKER is
-- correct, and EXECUTE is revoked on top: Postgres does not check EXECUTE when
-- a trigger fires, so every trigger keeps working while the RPC route closes.
-- Verified after applying: an anon INSERT still fires the trigger and
-- updated_at still advances on UPDATE.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
