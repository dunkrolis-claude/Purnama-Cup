import { getAdminClient } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const { pin, newPin } = req.body || {};
    if (!pin || !newPin || String(newPin).length < 4) {
      res.status(400).json({ ok: false, error: 'bad_request' });
      return;
    }
    const supabase = getAdminClient();

    const { data: pinOk, error: pinErr } = await supabase.rpc('verify_admin_pin', { p_pin: pin });
    if (pinErr) {
      console.error('verify_admin_pin error', pinErr);
      res.status(500).json({ ok: false, error: 'server_error' });
      return;
    }
    if (!pinOk) {
      res.status(401).json({ ok: false, error: 'invalid_pin' });
      return;
    }

    const { error } = await supabase.rpc('set_admin_pin', { p_new_pin: newPin });
    if (error) {
      console.error('set_admin_pin error', error);
      res.status(500).json({ ok: false, error: 'server_error' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('admin-change-pin error', e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
