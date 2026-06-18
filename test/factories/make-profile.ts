import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Profile } from '#domain/users/entities/profile.js';
import { faker } from '@faker-js/faker';

type ProfileOverride = {
  userId?: UniqueEntityID;
  username?: string;
  displayName?: string;
  bio?: string;
  country?: string;
  avatarUrl?: string | null;
  points?: number;
  totalPaid?: number;
  createdAt?: Date;
  updatedAt?: Date | null;
};

export function makeProfile(
  override: ProfileOverride = {},
  id?: UniqueEntityID,
): Profile {
  return Profile.create(
    {
      userId: new UniqueEntityID(),
      username: faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .slice(0, 30),
      displayName: faker.person.fullName(),
      ...override,
    },
    id,
  );
}
