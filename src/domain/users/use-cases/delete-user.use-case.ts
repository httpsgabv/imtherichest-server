import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { UsersRepository } from '../repositories/users-repository.js';

export type DeleteUserUseCaseRequest = {
  requesterId: string;
};

export type DeleteUserUseCaseResult = Either<ResourceNotFoundError, null>;

@Injectable()
export class DeleteUserUseCase implements UseCase<
  DeleteUserUseCaseRequest,
  DeleteUserUseCaseResult
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    params: DeleteUserUseCaseRequest,
  ): Promise<DeleteUserUseCaseResult> {
    const user = await this.usersRepository.findById(params.requesterId);

    if (!user) {
      return failure(new ResourceNotFoundError('User not found'));
    }

    await this.usersRepository.delete(params.requesterId);

    return success(null);
  }
}
