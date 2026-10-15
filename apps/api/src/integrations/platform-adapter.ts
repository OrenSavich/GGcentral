/**
 * Port for gaming-platform integrations.
 *
 * Adapters translate platform data into these snapshots. Vendor response
 * types stay inside the adapter. Steam and PSN clients are not implemented.
 * Null fields mean the platform did not supply a value. An empty array means
 * a completed fetch returned nothing.
 */

export const gamingPlatforms = ['steam', 'psn'] as const;

export type GamingPlatform = (typeof gamingPlatforms)[number];

export type UserAchievementState = 'unknown' | 'locked' | 'in_progress' | 'unlocked';

export interface PlatformProfileSnapshot {
  platform: GamingPlatform;
  externalId: string;
  handle: string | null;
  displayName: string | null;
  syncedAt: Date;
}

export interface PlatformGameSnapshot {
  platform: GamingPlatform;
  externalId: string;
  name: string;
  playtimeSeconds: number | null;
  lastPlayedAt: Date | null;
  syncedAt: Date;
}

export interface AchievementDefinitionSnapshot {
  platform: GamingPlatform;
  gameExternalId: string;
  externalId: string;
  name: string;
  description: string | null;
  syncedAt: Date;
}

export interface UserAchievementSnapshot {
  platform: GamingPlatform;
  gameExternalId: string;
  achievementExternalId: string;
  state: UserAchievementState;
  unlockedAt: Date | null;
  progressCurrent: number | null;
  progressTarget: number | null;
  syncedAt: Date;
}

export interface PlatformAdapter {
  readonly platform: GamingPlatform;
  fetchProfile(externalAccountId: string): Promise<PlatformProfileSnapshot>;
  fetchLibrary(externalAccountId: string): Promise<PlatformGameSnapshot[]>;
  fetchAchievementDefinitions(gameExternalId: string): Promise<AchievementDefinitionSnapshot[]>;
  fetchUserAchievements(
    externalAccountId: string,
    gameExternalId: string,
  ): Promise<UserAchievementSnapshot[]>;
}
