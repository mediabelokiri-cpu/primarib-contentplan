import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLOUD_ROW_ID = "primarib_main_v1";

function getSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://daspzztaezihzknwncxt.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_DNFw7yvW0nh5RJQSizL9_Q_yCAV_G2s";

  const headers: Record<string, string> = {
    apikey: key,
  };
  if (key.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${key}`;
  }
  return { url: url.replace(/\/$/, ""), headers };
}

export async function GET() {
  try {
    const { url, headers } = getSupabaseConfig();
    const res = await fetch(
      `${url}/rest/v1/primarib_cloud_state?id=eq.${CLOUD_ROW_ID}&select=state_json,updated_at`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Supabase", status: res.status },
        { status: 502 }
      );
    }

    const rows = await res.json();
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    return NextResponse.json(
      {
        state_json: row?.state_json || null,
        updated_at: row?.updated_at || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.state_json) {
      return NextResponse.json(
        { error: "Missing state_json payload" },
        { status: 400 }
      );
    }

    const { url, headers } = getSupabaseConfig();
    const res = await fetch(
      `${url}/rest/v1/primarib_cloud_state?on_conflict=id`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: CLOUD_ROW_ID,
          state_json: body.state_json,
          updated_at: new Date().toISOString(),
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to save to Supabase", status: res.status },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
