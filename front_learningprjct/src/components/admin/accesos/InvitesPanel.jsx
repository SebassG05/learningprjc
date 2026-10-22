/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useState } from 'react';
import { Ban, Copy, Link2 } from 'lucide-react';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/Field';
import { useToast } from '../../../context/ToastContext';
import { createCohortInvite, fetchCohortInvites, revokeCohortInvite } from '../../../lib/adminApi';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import FormField from '../ui/FormField';
import Skeleton from '../ui/Skeleton';
import { focusRing } from '../ui/tones';
import { COPY } from './accesosCopy';
import { inviteUsage } from './accesosQuery';

const STATUS_TONE = { active: 'brand', expired: 'neutral', revoked: 'danger', exhausted: 'dawn' };
const DAY = 24 * 60 * 60 * 1000;
const dateInput = (date) => date.toISOString().slice(0, 10);
const shortDate = (value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

// Enlaces de invitación de una cohorte: crear (individual o de N usos), copiar al crearlo, revocar
export default function InvitesPanel({ cohort }) {
  const { showToast } = useToast();
  const [state, setState] = useState({ status: 'loading', invites: [] });
  const [form, setForm] = useState({ email: '', maxUses: 1, expiresAt: dateInput(new Date(Date.now() + 14 * DAY)), send: true });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null); // { url, emailed }
  const [toRevoke, setToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const urlId = useId();

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCohortInvites(cohort._id, ctrl.signal)
      .then((invites) => setState({ status: 'ready', invites }))
      .catch((err) => err.name !== 'AbortError' && setState({ status: 'error', invites: [] }));
    return () => ctrl.abort();
  }, [cohort._id]);

  const set = (changes) => setForm((f) => ({ ...f, ...changes }));

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // La caducidad es el final del día elegido (hora local)
      const expiresAt = new Date(`${form.expiresAt}T23:59:59`).toISOString();
      const email = form.email.trim();
      const res = await createCohortInvite(cohort._id, { email: email || undefined, maxUses: Number(form.maxUses), expiresAt, send: Boolean(email) && form.send });
      setState((s) => ({ ...s, invites: [res.invite, ...s.invites] }));
      setCreated({ url: res.url, emailed: res.emailed });
      showToast(res.emailed ? COPY.invites.emailed : COPY.invites.created, 'success');
      set({ email: '' });
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
    } finally {
      setCreating(false);
    }
  };

  const copy = async () => {
    try {
      await copyText(created.url);
      showToast(COPY.invites.copied, 'success');
    } catch {
      document.getElementById(urlId)?.select();
      showToast(COPY.errors.copy, 'error');
    }
  };

  const confirmRevoke = async () => {
    setRevoking(true);
    try {
      const invite = await revokeCohortInvite(cohort._id, toRevoke._id);
      setState((s) => ({ ...s, invites: s.invites.map((i) => (i._id === invite._id ? invite : i)) }));
      showToast(COPY.invites.revoked, 'success');
      setToRevoke(null);
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,1fr)]">
          <FormField label={COPY.invites.email} name="email" hint={COPY.invites.emailHint}>
            {(props) => <input {...props} type="email" autoComplete="off" value={form.email} onChange={(e) => set({ email: e.target.value, maxUses: e.target.value ? 1 : form.maxUses })} className={inputClass} />}
          </FormField>
          <FormField label={COPY.invites.maxUses} name="maxUses">
            {(props) => (
              <input {...props} type="number" min={1} max={10000} inputMode="numeric" disabled={Boolean(form.email.trim())} value={form.maxUses} onChange={(e) => set({ maxUses: e.target.value })} className={inputClass} />
            )}
          </FormField>
          <FormField label={COPY.invites.expiresAt} name="expiresAt">
            {(props) => <input {...props} type="date" min={dateInput(new Date())} value={form.expiresAt} onChange={(e) => set({ expiresAt: e.target.value })} className={inputClass} />}
          </FormField>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {form.email.trim() ? (
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.send} onChange={(e) => set({ send: e.target.checked })} className="h-5 w-5 accent-brand-400" />
              <span className="text-callout text-ink">{COPY.invites.send}</span>
            </label>
          ) : null}
          <Button type="submit" disabled={creating} aria-busy={creating || undefined}>
            <Link2 className="h-4 w-4" aria-hidden="true" />
            {creating ? COPY.invites.creating : COPY.invites.create}
          </Button>
        </div>
      </form>

      {created ? (
        <div role="status" className="space-y-3 rounded-2xl border border-brand/30 bg-brand/[0.06] p-4">
          <p className="text-callout font-medium text-ink">{COPY.invites.copyNow}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id={urlId} readOnly value={created.url} onFocus={(e) => e.target.select()} aria-label={COPY.invites.copy} className={`${inputClass} font-mono text-sm`} />
            <Button type="button" variant="secondary" onClick={copy} className="shrink-0">
              <Copy className="h-4 w-4" aria-hidden="true" />
              {COPY.invites.copy}
            </Button>
          </div>
        </div>
      ) : null}

      {state.status === 'loading' ? (
        <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : state.status === 'error' ? (
        <p role="alert" className="text-callout text-danger">{COPY.errors.generic}</p>
      ) : state.invites.length === 0 ? (
        <p className="text-callout text-ink-3">{COPY.invites.empty}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {state.invites.map((invite) => {
            const who = invite.email ?? COPY.invites.anyone;
            return (
              <li key={invite._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{who}</p>
                  <p className="text-footnote text-ink-3">
                    {[invite.kind === 'claim' ? COPY.invites.claim : null, inviteUsage(invite), COPY.invites.expires(shortDate(invite.expiresAt))].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Badge label={COPY.invites.status[invite.status]} toneName={STATUS_TONE[invite.status]} size="sm" />
                {invite.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => setToRevoke(invite)}
                    aria-label={COPY.invites.revokeLabel(who)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-2 hover:bg-white/[0.06] hover:text-danger ${focusRing}`}
                  >
                    <Ban className="h-4 w-4" aria-hidden="true" />
                    {COPY.invites.revoke}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toRevoke)}
        title={COPY.invites.revokeConfirm.title}
        description={COPY.invites.revokeConfirm.body}
        confirmLabel={COPY.invites.revokeConfirm.confirm}
        destructive
        busy={revoking}
        onCancel={() => setToRevoke(null)}
        onConfirm={confirmRevoke}
      />
    </div>
  );
}
