import { notFound } from 'next/navigation';
import { saveProject } from '../../actions';
import { Checkbox, Field, SubmitBar, TextArea, TextInput } from '@/components/admin/Field';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase/server';
import type { ProjectRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'עריכת פרויקט' };

export default async function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';

  let project: ProjectRow | null = null;
  if (!isNew) {
    const supabase = await createServerSupabase();
    const { data } = (await supabase?.from('projects').select('*').eq('id', id).maybeSingle()) ?? {
      data: null,
    };
    if (!data) notFound();
    project = data;
  }

  return (
    <Container className="max-w-3xl">
      <h1 className="text-h2 text-fg mb-8">{isNew ? 'פרויקט חדש' : project?.business_name}</h1>

      <form action={saveProject} className="flex flex-col gap-6">
        {project ? <input type="hidden" name="id" value={project.id} /> : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="שם העסק" name="business_name">
            <TextInput name="business_name" required defaultValue={project?.business_name ?? ''} />
          </Field>

          <Field label="קטגוריה" name="category" hint="לדוגמה: אתר תדמית, חנות, מיתוג">
            <TextInput name="category" required defaultValue={project?.category ?? ''} />
          </Field>

          <Field label="Slug" name="slug" hint="אנגלית, מקפים. זו הכתובת בעמוד.">
            <TextInput
              name="slug"
              required
              dir="ltr"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="text-start"
              defaultValue={project?.slug ?? ''}
            />
          </Field>

          <Field label="קישור לאתר החי" name="live_url">
            <TextInput
              name="live_url"
              type="url"
              dir="ltr"
              className="text-start"
              defaultValue={project?.live_url ?? ''}
            />
          </Field>
        </div>

        <Field label="תיאור קצר" name="description">
          <TextArea name="description" rows={2} defaultValue={project?.description ?? ''} />
        </Field>

        <Field label="שירותים" name="services" hint="מופרדים בפסיק">
          <TextInput name="services" defaultValue={project?.services.join(', ') ?? ''} />
        </Field>

        <Field label="האתגר" name="challenge">
          <TextArea name="challenge" rows={4} defaultValue={project?.challenge ?? ''} />
        </Field>

        <Field label="הפתרון" name="solution">
          <TextArea name="solution" rows={4} defaultValue={project?.solution ?? ''} />
        </Field>

        <Field label="התוצאות" name="results" hint="רק תוצאות אמיתיות שאפשר לגבות.">
          <TextArea name="results" rows={4} defaultValue={project?.results ?? ''} />
        </Field>

        <ImageUpload name="cover_image" label="תמונת נושא" defaultValue={project?.cover_image} />
        <ImageUpload
          name="gallery"
          label="גלריה"
          multiple
          defaultValue={project?.gallery.join(',')}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="סדר תצוגה" name="order_index">
            <TextInput
              name="order_index"
              type="number"
              defaultValue={String(project?.order_index ?? 0)}
            />
          </Field>

          <div className="flex items-end pb-2.5">
            <Checkbox name="featured" label="מודגש" defaultChecked={project?.featured} />
          </div>

          <div className="flex items-end pb-2.5">
            <Checkbox name="published" label="מפורסם" defaultChecked={project?.published} />
          </div>
        </div>

        <SubmitBar cancelHref="/admin/projects" />
      </form>
    </Container>
  );
}
