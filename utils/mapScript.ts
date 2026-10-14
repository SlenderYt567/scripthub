import type { Script } from '../types';

export function mapScript(row: any): Script {
  return {
    id: row.id,
    title: row.title,
    gameName: row.game_name,
    description: row.description || '',
    imageUrl: row.image_url || '',
    author: row.author,
    author_id: row.author_id ?? undefined,
    views: row.views ?? 0,
    rawLink: row.raw_link ?? undefined,
    shortenerLink: row.shortener_link ?? undefined,
    verified: row.verified,
    isOfficial: row.is_official,
    keySystem: row.key_system ?? false,
    createdAt: new Date(row.created_at).getTime(),
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at).getTime() : undefined,
    tasks: row.tasks || [],
  };
}
