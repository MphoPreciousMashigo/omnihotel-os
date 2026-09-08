import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://niuhhbqpuwdjbapbqclj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_A2z0Wd48M7Rp1eCD4mMP8Q_Ztbpx35l";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
