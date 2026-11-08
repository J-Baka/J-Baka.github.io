/* =============================================================
   A tiny pubsub with the same call shape as OmniStudio's
   `omnistudio/pubsub` module, so the demo code reads like the
   real thing:

     pubsub.register('channel', { eventName: handler });
     pubsub.fire('channel', 'eventName', payload);
     pubsub.unregister('channel', { eventName: handler });

   Plus `tap(fn)`, which lets the demo's event log see every
   message (OmniStudio has no equivalent; it's just for display).
   ============================================================= */

const channels = new Map(); // channel -> Map(eventName -> Set(handler))
const taps = new Set();

function register(channel, handlers) {
  if (!channels.has(channel)) channels.set(channel, new Map());
  const events = channels.get(channel);
  for (const [eventName, handler] of Object.entries(handlers)) {
    if (!events.has(eventName)) events.set(eventName, new Set());
    events.get(eventName).add(handler);
  }
}

function unregister(channel, handlers) {
  const events = channels.get(channel);
  if (!events) return;
  for (const [eventName, handler] of Object.entries(handlers)) {
    events.get(eventName)?.delete(handler);
  }
}

function fire(channel, eventName, payload) {
  // Copy the payload so subscribers can't mutate the publisher's state.
  const data = payload === undefined ? undefined : structuredClone(payload);
  taps.forEach((fn) => fn({ channel, eventName, payload: data, at: new Date() }));
  channels.get(channel)?.get(eventName)?.forEach((handler) => handler(data));
}

function tap(fn) {
  taps.add(fn);
  return () => taps.delete(fn);
}

export const pubsub = { register, unregister, fire, tap };
