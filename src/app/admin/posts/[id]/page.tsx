import { notFound } from 'next/navigation';
import { savePost } from '../../actions';
import { Checkbox, Field, SubmitBar, TextArea, TextInput } from '@/components/admin/Field';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase/server';
import type { PostRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'עריכת מאמר' };

export default async function PostEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';

  let post: PostRow | null = null;
  if (!isNew) {
    const supabase = await createServerSupabase();
    const { data } = (await supabase?.from('posts').select('*').eq('id', id).maybeSingle()) ?? {
      data: null,
    };
    if (!data) notFound();
    post = data;
  }

  return (
    <Container className="max-w-3xl">
      <h1 className="text-h2 text-fg mb-8">{isNew ? 'מאמר חדש' : post?.title}</h1>

      <form action={savePost} className="flex flex-col gap-6">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}
        {post?.published_at ? (
          <input type="hidden" name="published_at" value={post.published_at} />
        ) : null}

        <Field label="כותרת" name="title">
          <TextInput name="title" required defaultValue={post?.title ?? ''} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Slug" name="slug" hint="אנגלית, מקפים.">
            <TextInput
              name="slug"
              required
              dir="ltr"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="text-start"
              defaultValue={post?.slug ?? ''}
            />
          </Field>

          <Field label="קטגוריה" name="category">
            <TextInput name="category" defaultValue={post?.category ?? ''} />
          </Field>
        </div>

        <Field label="תקציר" name="excerpt" hint="עד 400 תווים. מופיע בכרטיס ובתוצאות חיפוש.">
          <TextArea name="excerpt" rows={2} maxLength={400} defaultValue={post?.excerpt ?? ''} />
        </Field>

        <ImageUpload name="cover_image" label="תמונת נושא" defaultValue={post?.cover_image} />

        <Field
          label="תוכן"
          name="content_mdx"
          hint="Markdown. כותרות ## הופכות אוטומטית לתוכן עניינים."
        >
          <TextArea
            name="content_mdx"
            rows={20}
            className="font-mono text-[13px]"
            defaultValue={post?.content_mdx ?? ''}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="זמן קריאה (דקות)" name="reading_time">
            <TextInput
              name="reading_time"
              type="number"
              min={1}
              max={120}
              defaultValue={post?.reading_time ? String(post.reading_time) : ''}
            />
          </Field>

          <div className="flex items-end pb-2.5">
            <Checkbox name="published" label="מפורסם" defaultChecked={post?.published} />
          </div>
        </div>

        <div className="border-line rounded-card border p-5">
          <h2 className="text-fg mb-4 text-sm font-bold">SEO</h2>
          <div className="flex flex-col gap-5">
            <Field label="כותרת SEO" name="seo_title" hint="עד 70 תווים. ריק = הכותרת הרגילה.">
              <TextInput name="seo_title" maxLength={70} defaultValue={post?.seo_title ?? ''} />
            </Field>
            <Field label="תיאור SEO" name="seo_description" hint="עד 200 תווים.">
              <TextArea
                name="seo_description"
                rows={2}
                maxLength={200}
                defaultValue={post?.seo_description ?? ''}
              />
            </Field>
          </div>
        </div>

        <SubmitBar cancelHref="/admin/posts" />
      </form>
    </Container>
  );
}
