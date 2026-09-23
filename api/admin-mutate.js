import { getAdminClient } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const { pin, id, expectedVersion, newState, operation } = req.body || {};
    if (!pin || !id || typeof expectedVersion !== 'number' || !newState) {
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

    const { data, error } = await supabase.rpc('cas_update_tournament_state', {
      p_id: id,
      p_expected_version: expectedVersion,
      p_new_state: newState,
      p_operation: operation || 'unknown',
      p_source: 'vercel-gateway'
    });
    if (error) {
      console.error('cas_update_tournament_state error', error);
      res.status(500).json({ ok: false, error: 'server_error' });
      return;
    }
    // data is already the {ok, conflict, not_found, state, version, updated_at} shape.
    res.status(200).json(data);
  } catch (e) {
    console.error('admin-mutate error', e);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
