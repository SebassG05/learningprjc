import { InviteError, previewInvite, redeemInvite } from '../service/cohortInvites.js';

const INVITE_ERRORS = {
  invalid: { status: 404, error: 'Esta invitación no es válida. Revisa que el enlace esté completo.' },
  expired: { status: 410, error: 'Esta invitación ha caducado. Pide un enlace nuevo a quien te invitó.' },
  revoked: { status: 410, error: 'Esta invitación se ha anulado. Pide un enlace nuevo a quien te invitó.' },
  exhausted: { status: 410, error: 'Esta invitación ya se ha usado todas las veces permitidas.' },
};

/**
 * Canjear una invitación: mete al usuario con sesión en la cohorte.
 * @route POST /api/cohorts/invitations/redeem  { token }
 * @access Private (con rate limit)
 */
export const canjearInvitacion = async (req, res, next) => {
  try {
    const result = await redeemInvite({ token: req.body?.token, user: req.user });
    return res.json(result);
  } catch (err) {
    if (err instanceof InviteError && INVITE_ERRORS[err.code]) {
      const { status, error } = INVITE_ERRORS[err.code];
      return res.status(status).json({ error, code: err.code });
    }
    return next(err);
  }
};

/**
 * Datos para pintar la página de invitación (sin sesión).
 * @route GET /api/cohorts/invitations/preview?token=
 * @access Public (con rate limit)
 */
export const verInvitacion = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    const preview = await previewInvite(req.query.token);
    return res.json(preview.valid ? preview : { ...preview, error: INVITE_ERRORS[preview.code]?.error });
  } catch (err) {
    return next(err);
  }
};
