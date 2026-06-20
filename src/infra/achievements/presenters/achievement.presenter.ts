import type { AchievementDefinition } from '#domain/achievements/data/achievement-definitions.js';

export class AchievementPresenter {
  static present(definition: AchievementDefinition) {
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      category: definition.category,
    };
  }
}
