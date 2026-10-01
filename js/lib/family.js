// Familienliste (wer kocht?): ein Dokument einstellungen/familie = { mitglieder: string[] }.
export const MAX_MEMBERS = 12;
export const MAX_NAME = 30;

export function familyMembers(ctx) {
  const doc = ctx.state.einstellungen && ctx.state.einstellungen.familie;
  return Array.isArray(doc && doc.mitglieder) ? doc.mitglieder.filter((n) => typeof n === 'string' && n.trim()) : [];
}

export function saveFamily(ctx, mitglieder) {
  ctx.save(ctx.store.set('einstellungen', 'familie', { mitglieder }));
}
