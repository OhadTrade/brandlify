'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env';

/**
 * Uploads an image to the `media` bucket and writes its public URL into a
 * hidden field on the surrounding form.
 *
 * Goes straight from the browser to Supabase Storage using the admin's own
 * session — the storage policy only allows inserts for `authenticated`, so the
 * permission check is the database's, not this component's. Bypassing the
 * Next server also means a 10 MB image never travels through a serverless
 * function.
 */
export function ImageUpload({
  name,
  label,
  defaultValue,
  multiple = false,
}: {
  name: string;
  label: string;
  /** Existing value: one URL, or a comma-separated list when multiple. */
  defaultValue?: string | null;
  multiple?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urls = value.split(',').map((u) => u.trim()).filter(Boolean);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase לא מוגדר');
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        // Random name: keeps the bucket flat, avoids collisions, and stops a
        // visitor's filename from ending up in a public URL.
        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, file, { cacheControl: '31536000', upsert: false });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('media').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setValue(multiple ? [...urls, ...uploaded].join(',') : uploaded[0]!);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ההעלאה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-fg text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn cursor-pointer border px-4 py-2.5 text-sm transition-colors">
          {busy ? 'מעלה…' : 'בחירת תמונה'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            multiple={multiple}
            className="sr-only"
            disabled={busy}
            onChange={(e) => void upload(e.target.files)}
          />
        </label>

        {urls.length > 0 ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="text-muted hover:text-pink text-xs transition-colors"
          >
            ניקוי
          </button>
        ) : null}
      </div>

      {error ? <p className="text-pink text-xs">{error}</p> : null}

      {urls.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-2">
          {urls.map((url) => (
            <li key={url} className="border-line rounded-card overflow-hidden border">
              {/* Plain img: these are arbitrary Supabase URLs in an admin-only
                  screen, so next/image optimisation buys nothing here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-28 object-cover" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
