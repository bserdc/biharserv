import express from 'express';
import { supabase } from '../lib/supabase';

export type StaffRole = 'examiner' | 'principal';

export type TrustedStaffAccount = {
  id: string;
  auth_user_id: string;
  role: StaffRole;
  active: boolean;
  approved: boolean;
  udise_code: string | null;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; app_metadata?: Record<string, unknown> };
      staffAccount?: TrustedStaffAccount;
    }
  }
}

export async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : '';
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required.' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  req.authUser = { id: data.user.id, app_metadata: data.user.app_metadata };
  return next();
}

export function requireStaffRole(role: StaffRole) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await requireAuth(req, res, async () => {
      const { data, error } = await supabase.from('staff_accounts')
        .select('id, auth_user_id, role, active, approved, udise_code')
        .eq('auth_user_id', req.authUser!.id)
        .eq('role', role)
        .maybeSingle();
      if (error || !data || !data.active || !data.approved) {
        return res.status(403).json({ success: false, error: 'Active, approved staff access required.' });
      }
      req.staffAccount = data as TrustedStaffAccount;
      return next();
    });
  };
}

export const requireExaminer = requireStaffRole('examiner');
export const requirePrincipal = requireStaffRole('principal');

export function requireRole(...roles: Array<StaffRole | 'admin'>) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : '';
    if (!token) return res.status(401).json({ success: false, error: 'Authentication required.' });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
    req.authUser = { id: data.user.id, app_metadata: data.user.app_metadata };
    if (roles.includes('admin') && data.user.app_metadata?.role === 'admin') return next();
    for (const role of roles.filter((value): value is StaffRole => value !== 'admin')) {
      const result = await supabase.from('staff_accounts').select('id, auth_user_id, role, active, approved, udise_code').eq('auth_user_id', data.user.id).eq('role', role).maybeSingle();
      if (!result.error && result.data?.active && result.data.approved) { req.staffAccount = result.data as TrustedStaffAccount; return next(); }
    }
    return res.status(403).json({ success: false, error: 'Insufficient role permissions.' });
  };
}

// Use this guard on every future Principal-scoped route. The UDISE is read from
// staff_accounts, never trusted from request input.
export function requireTrustedPrincipalUdise(req: express.Request, res: express.Response, next: express.NextFunction) {
  const trusted = req.staffAccount?.udise_code;
  if (!trusted) return res.status(403).json({ success: false, error: 'No trusted UDISE assignment exists.' });
  const requested = [req.body?.udise_code, req.query.udise_code, req.params.udise_code]
    .find((value) => typeof value === 'string' && value.trim() !== '');
  if (requested && String(requested).trim() !== trusted) {
    return res.status(403).json({ success: false, error: 'Cross-school access is forbidden.' });
  }
  return next();
}
