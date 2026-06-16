import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { makeUser } from '#test/factories/make-user.js';
import { InMemoryUsersRepository } from '#test/users/in-memory-users-repository.js';
import { DeleteUserUseCase } from './delete-user.use-case.js';

describe('DeleteUserUseCase', () => {
  let repository: InMemoryUsersRepository;
  let sut: DeleteUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    sut = new DeleteUserUseCase(repository);
  });

  it('should delete the user when it exists', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'));
    repository.items.push(user);

    const result = await sut.execute({
      requesterId: 'user-1',
    });

    expect(result.isSuccess()).toBe(true);
    expect(repository.items).toHaveLength(0);
  });

  it('should fail with ResourceNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      requesterId: 'user-1',
    });

    expect(result.isFailure()).toBe(true);
    expect((result as any).value.message).toBe('User not found');
  });
});
