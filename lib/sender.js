const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

export async function addSubscriber({ email, name }) {
  const nameParts = (name || "").trim().split(/\s+/);
  const res = await fetch(`${SENDER_API}/subscribers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      firstname: nameParts[0] || "",
      lastname: nameParts.slice(1).join(" ") || "",
      groups: [NEWSLETTER_GROUP],
      trigger_automation: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sender API ${res.status}: ${err}`);
  }
  return res.json();
}

export { NEWSLETTER_GROUP };
