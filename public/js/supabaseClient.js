import { createClient }
from "https://esm.sh/@supabase/supabase-js";



const SUPABASE_URL = "https://iihmlqpzhtdhfgrnhqch.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uaqnTrZdQoed7A9If4UpAg_IeXzQtgt";

export const supabase =
createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);