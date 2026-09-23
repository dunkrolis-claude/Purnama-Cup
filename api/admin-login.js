import { getAdminClient } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const { pin } = req.body || {};
    if (!pin) {
      res.status(400).json({ ok: false, error: 'missing_pin' });
      return;
    }
    const supabase = getAdminClient();
    const { data, error } = await supabase.rpc('verify_admin_pin', { p_pin: pin });
    if (error) {
      console.error('verify_admin_pin error', error);
      res.status(500).json({ ok: false, error: 'server_error' });
      return;
    }
    if (!data) {
      res.status(401).json({ ok: false, error: 'invalid_pin' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('admin-login error', e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
