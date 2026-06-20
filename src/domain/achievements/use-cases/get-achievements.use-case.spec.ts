import { achievementDefinitions } from '../data/achievement-definitions.js';
import { GetAchievementsUseCase } from './get-achievements.use-case.js';

describe('GetAchievementsUseCase', () => {
  it('should return all achievement definitions', async () => {
    const sut = new GetAchievementsUseCase();

    const result = await sut.execute();

    expect(result.achievements).toBe(achievementDefinitions);
    expect(result.achievements).toHaveLength(achievementDefinitions.length);
  });

  it('should return definitions across all three categories', async () => {
    const sut = new GetAchievementsUseCase();

    const result = await sut.execute();

    const categories = new Set(result.achievements.map((a) => a.category));
    expect(categories).toEqual(new Set(['normal', 'weird', 'meme']));
  });
});
