import { deleteRow, saveTestimonial, toggleApproved } from '../actions';
import { Field, TextArea, TextInput } from '@/components/admin/Field';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase/server';
import type { TestimonialRow } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ביקורות' };

export default async function AdminTestimonialsPage() {
  const supabase = await createServerSupabase();
  const { data, error } = (await supabase
    ?.from('testimonials')
    .select('*')
    .order('order_index')
    .order('created_at', { ascending: false })) ?? { data: null, error: null };

  const testimonials: TestimonialRow[] = data ?? [];
  const approved = testimonials.filter((t) => t.approved).length;

  return (
    <Container className="flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-h2 text-fg">ביקורות</h1>
        <p className="text-muted mt-1 text-sm">
          {testimonials.length} סה״כ · {approved} מאושרות
        </p>
      </div>

      <div className="border-line rounded-card border border-dashed p-5">
        <p className="text-muted text-sm leading-relaxed">
          מקטע הביקורות באתר מוצג רק כשיש לפחות ביקורת אחת <strong className="text-fg">מאושרת</strong>.
          עד אז מוצג במקומו מקטע ההתחייבויות. אין ולא יהיו כאן ביקורות דמה — כל ביקורת צריכה להיות
          אמיתית ובאישור הלקוח.
        </p>
      </div>

      {error ? (
        <p className="border-magenta text-pink rounded-card border p-4 text-sm">{error.message}</p>
      ) : null}

      <section className="border-line bg-surface rounded-card border p-6">
        <h2 className="text-fg mb-5 font-bold">הוספת ביקורת</h2>
        <form action={saveTestimonial} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="שם הלקוח" name="client_name">
              <TextInput name="client_name" required />
            </Field>
            <Field label="שם העסק" name="business_name">
              <TextInput name="business_name" />
            </Field>
          </div>

          <Field label="תוכן הביקורת" name="content">
            <TextArea name="content" rows={4} required maxLength={1200} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="דירוג (1-5)" name="rating">
              <TextInput name="rating" type="number" min={1} max={5} defaultValue="5" />
            </Field>
            <Field label="סדר תצוגה" name="order_index">
              <TextInput name="order_index" type="number" defaultValue="0" />
            </Field>
          </div>

          <div>
            <button
              type="submit"
              className="bg-cta rounded-btn font-heading flex h-11 items-center px-6 font-bold text-white"
            >
              הוספה (כטיוטה)
            </button>
          </div>
        </form>
      </section>

      <ul className="flex flex-col gap-3">
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            className="border-line bg-surface rounded-card flex flex-wrap items-start justify-between gap-4 border p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-fg font-bold">{testimonial.client_name}</h2>
                {testimonial.business_name ? (
                  <span className="text-muted text-sm">{testimonial.business_name}</span>
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    testimonial.approved
                      ? 'bg-[rgb(52_211_153/0.15)] text-[#6EE7B7]'
                      : 'text-muted bg-[rgb(250_250_252/0.06)]'
                  }`}
                >
                  {testimonial.approved ? 'מאושרת' : 'ממתינה'}
                </span>
              </div>
              <p className="text-muted mt-2 text-sm leading-relaxed">{testimonial.content}</p>
            </div>

            <div className="flex items-center gap-2">
              <form action={toggleApproved}>
                <input type="hidden" name="id" value={testimonial.id} />
                <input type="hidden" name="next" value={String(!testimonial.approved)} />
                <button
                  type="submit"
                  className="border-line text-muted hover:text-fg hover:border-magenta rounded-btn border px-4 py-2 text-sm transition-colors"
                >
                  {testimonial.approved ? 'לבטל אישור' : 'לאשר'}
                </button>
              </form>

              <form action={deleteRow}>
                <input type="hidden" name="table" value="testimonials" />
                <input type="hidden" name="id" value={testimonial.id} />
                <button
                  type="submit"
                  className="text-muted hover:text-pink px-2 text-sm transition-colors"
                >
                  מחיקה
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
