import type {
  AchievementDefinitionSnapshot,
  PlatformAdapter,
  PlatformGameSnapshot,
  PlatformProfileSnapshot,
  UserAchievementSnapshot,
} from './platform-adapter.js';

describe('PlatformAdapter', () => {
  const syncedAt = new Date('2026-10-15T00:00:00.000Z');

  it('returns platform-scoped snapshots and keeps unknown playtime distinct from zero', async () => {
    const adapter = new InMemoryPlatformAdapter({
      profile: {
        platform: 'steam',
        externalId: '76561198000000000',
        handle: 'example',
        displayName: 'Example',
        syncedAt,
      },
      games: [
        {
          platform: 'steam',
          externalId: '620',
          name: 'Portal 2',
          playtimeSeconds: null,
          lastPlayedAt: null,
          syncedAt,
        },
        {
          platform: 'steam',
          externalId: '400',
          name: 'Portal',
          playtimeSeconds: 0,
          lastPlayedAt: null,
          syncedAt,
        },
      ],
    });

    const profile = await adapter.fetchProfile('76561198000000000');
    const library = await adapter.fetchLibrary('76561198000000000');

    expect(profile.platform).toBe('steam');
    expect(profile.externalId).toBe('76561198000000000');
    expect(library).toHaveLength(2);
    expect(library[0]?.playtimeSeconds).toBeNull();
    expect(library[1]?.playtimeSeconds).toBe(0);
  });

  it('returns an empty library when the account has no games', async () => {
    const adapter = new InMemoryPlatformAdapter({
      profile: {
        platform: 'psn',
        externalId: 'account-1',
        handle: null,
        displayName: null,
        syncedAt,
      },
      games: [],
    });

    await expect(adapter.fetchLibrary('account-1')).resolves.toEqual([]);
  });

  it('preserves an unknown achievement state', async () => {
    const adapter = new InMemoryPlatformAdapter({
      profile: {
        platform: 'psn',
        externalId: 'account-1',
        handle: 'player',
        displayName: 'Player',
        syncedAt,
      },
      games: [],
      achievements: [
        {
          platform: 'psn',
          gameExternalId: 'NPWR00001_00',
          achievementExternalId: '1',
          state: 'unknown',
          unlockedAt: null,
          progressCurrent: null,
          progressTarget: null,
          syncedAt,
        },
      ],
    });

    const progress = await adapter.fetchUserAchievements('account-1', 'NPWR00001_00');

    expect(progress[0]).toMatchObject({
      platform: 'psn',
      state: 'unknown',
      unlockedAt: null,
    });
  });
});

class InMemoryPlatformAdapter implements PlatformAdapter {
  readonly platform: PlatformAdapter['platform'];

  constructor(
    private readonly data: {
      profile: PlatformProfileSnapshot;
      games: PlatformGameSnapshot[];
      definitions?: AchievementDefinitionSnapshot[];
      achievements?: UserAchievementSnapshot[];
    },
  ) {
    this.platform = data.profile.platform;
  }

  fetchProfile(externalAccountId: string): Promise<PlatformProfileSnapshot> {
    if (externalAccountId !== this.data.profile.externalId) {
      return Promise.reject(new Error('Unknown account'));
    }

    return Promise.resolve(this.data.profile);
  }

  fetchLibrary(externalAccountId: string): Promise<PlatformGameSnapshot[]> {
    if (externalAccountId !== this.data.profile.externalId) {
      return Promise.reject(new Error('Unknown account'));
    }

    return Promise.resolve(this.data.games);
  }

  fetchAchievementDefinitions(gameExternalId: string): Promise<AchievementDefinitionSnapshot[]> {
    const definitions = (this.data.definitions ?? []).filter(
      (definition) => definition.gameExternalId === gameExternalId,
    );
    return Promise.resolve(definitions);
  }

  fetchUserAchievements(
    externalAccountId: string,
    gameExternalId: string,
  ): Promise<UserAchievementSnapshot[]> {
    if (externalAccountId !== this.data.profile.externalId) {
      return Promise.reject(new Error('Unknown account'));
    }

    const achievements = (this.data.achievements ?? []).filter(
      (achievement) => achievement.gameExternalId === gameExternalId,
    );
    return Promise.resolve(achievements);
  }
}
