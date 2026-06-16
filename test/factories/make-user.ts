import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { User } from '#domain/users/entities/user.js';
import { faker } from '@faker-js/faker';

type UserProps = {
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
};

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
): User {
  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: false,
      ...override,
    },
    id,
  );
}
