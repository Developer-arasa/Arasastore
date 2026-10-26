import "server-only";

const FONNTE_API = "https://api.fonnte.com/send";

/**
 * Kirim pesan WhatsApp via Fonnte.
 * Hanya boleh dipanggil dari sisi server (API routes).
 */
export async function sendWhatsApp(target: string, message: string) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    throw new Error("FONNTE_TOKEN belum di-set di environment.");
  }

  const res = await fetch(FONNTE_API, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target, message }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data?.status !== true) {
    throw new Error(data?.reason || `Fonnte error (HTTP ${res.status})`);
  }

  return data;
}
