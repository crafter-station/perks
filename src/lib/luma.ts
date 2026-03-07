type LumaGuestResult =
  | { ok: true; name: string }
  | { ok: false; reason: "not_found" | "not_approved" };

export async function getLumaGuest(email: string): Promise<LumaGuestResult> {
  const eventIds = [process.env.LUMA_EVENT, process.env.LUMA_EVENT_2].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const apiKey = process.env.LUMA_API_KEY ?? "";
  let foundButNotApproved = false;

  for (const eventId of eventIds) {
    const url = new URL("https://public-api.luma.com/v1/event/get-guest");
    url.searchParams.set("event_id", eventId);
    url.searchParams.set("id", email);

    const res = await fetch(url.toString(), {
      headers: { "x-luma-api-key": apiKey },
    });

    if (!res.ok) {
      continue;
    }

    const { guest } = await res.json();

    if (guest.approval_status !== "approved") {
      foundButNotApproved = true;
      continue;
    }

    const firstName = guest.user_first_name ?? "";
    const lastName = guest.user_last_name ?? "";
    const fullName =
      `${firstName} ${lastName}`.trim() || guest.user_name || email;

    return { ok: true, name: fullName };
  }

  if (foundButNotApproved) {
    return { ok: false, reason: "not_approved" };
  }

  return { ok: false, reason: "not_found" };
}
