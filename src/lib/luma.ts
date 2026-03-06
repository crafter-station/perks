type LumaGuestResult =
  | { ok: true; name: string }
  | { ok: false; reason: "not_found" | "not_approved" };

export async function getLumaGuest(email: string): Promise<LumaGuestResult> {
  const eventId = process.env.LUMA_EVENT ?? "";
  const apiKey = process.env.LUMA_API_KEY ?? "";

  const url = new URL("https://public-api.luma.com/v1/event/get-guest");
  url.searchParams.set("event_id", eventId);
  url.searchParams.set("id", email);

  const res = await fetch(url.toString(), {
    headers: { "x-luma-api-key": apiKey },
  });

  if (!res.ok) {
    return { ok: false, reason: "not_found" };
  }

  const { guest } = await res.json();

  if (guest.approval_status !== "approved") {
    return { ok: false, reason: "not_approved" };
  }

  const firstName = guest.user_first_name ?? "";
  const lastName = guest.user_last_name ?? "";
  const fullName =
    `${firstName} ${lastName}`.trim() || guest.user_name || email;

  return { ok: true, name: fullName };
}
