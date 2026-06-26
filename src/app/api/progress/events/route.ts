import { NextResponse } from "next/server";
import { getProgressData } from "@/app/actions/progress.actions";

/**
 * SSE endpoint for progress bar.
 *
 * Works on Vercel serverless (pro plan: up to 60s streaming).
 * The client reconnects automatically when the stream ends.
 *
 * GET /api/progress/events
 */
export async function GET() {
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        if (closed) return;
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // ── Heartbeat every 15s to keep connection alive ──
      const heartbeat = setInterval(() => {
        send("heartbeat", { ts: Date.now() });
      }, 15_000);

      // ── Main loop: fetch & push every 5s ──
      while (!closed) {
        try {
          const data = await getProgressData();
          send("progress", data ?? { error: "no_data" });
        } catch (err) {
          send("error", { message: "Erreur lors du chargement des données" });
        }

        // Wait 5 seconds, but check every 500ms if closed
        for (let i = 0; i < 10 && !closed; i++) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      clearInterval(heartbeat);
      controller.close();
    },
    cancel() {
      closed = true;
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // désactive le buffering nginx
    },
  });
}