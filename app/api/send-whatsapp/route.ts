import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/fonnte";

type Payload =
  | {
      type: "new_session";
      agency: string;
      groupName: string;
      sessionId: string;
    }
  | {
      type: "finalize_order";
      agency: string;
      groupName: string;
      sessionId: string;
      totalPassengers: number;
      productsText: string;
    };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;

    let target = "";
    let message = "";

    if (body.type === "new_session") {
      target = process.env.FONNTE_TARGET_ADMIN || "";
      message =
        `*INFORMATION*\n` +
        `*ADA PEMBUATAN SESI BARU*\n\n` +
        `Biro : ${body.agency}\n` +
        `ID sesi : ${body.sessionId.substring(0, 8)}\n` +
        `nama rombongan : ${body.groupName}\n\n` +
        `Silahkan cek di https://arasa-control.vercel.app/\n` +
        `terima kasih\n\n\n\n` +
        `_pesan ini terkirim otomatis dari Arasa Business Portal_`;
    } else if (body.type === "finalize_order") {
      target = process.env.FONNTE_TARGET_GROUP || "";
      message =
        `📦 *Konfirmasi Pesanan Rombongan*\n` +
        `🏢 Biro: ${body.agency}\n` +
        `📋 Rombongan: ${body.groupName}\n` +
        `🆔 ID Sesi: ${body.sessionId.substring(0, 8)}\n` +
        `👥 Penumpang: ${body.totalPassengers}\n\n` +
        `🛒 *Rekap Produk:*\n` +
        `${body.productsText}\n\n` +
        `_pesan ini terkirim otomatis dari Arasa Business Portal_`;
    } else {
      return NextResponse.json(
        { ok: false, error: "Type tidak dikenal." },
        { status: 400 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { ok: false, error: "Target belum di-set di environment." },
        { status: 500 }
      );
    }

    await sendWhatsApp(target, message);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Gagal kirim notifikasi WhatsApp:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}
