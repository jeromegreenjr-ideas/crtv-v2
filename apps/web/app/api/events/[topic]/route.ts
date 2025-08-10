import { NextRequest } from 'next/server';
import { eventBus } from '@/lib/eventBus';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { topic: string } }) {
  const topic = params.topic;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const listener = (payload: unknown) => send(payload);
      eventBus.on(topic, listener);

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
      }, 15000);

      // Initial message
      send({ ready: true, topic });

      return () => {
        clearInterval(heartbeat);
        eventBus.off(topic, listener);
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}