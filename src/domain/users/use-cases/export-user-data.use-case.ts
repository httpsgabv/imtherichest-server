import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import {
  UsersRepository,
  type UserExportData,
} from '../repositories/users-repository.js';

export type ExportUserDataUseCaseRequest = {
  requesterId: string;
};

export type ExportUserDataUseCaseResponse = UserExportData;

export type ExportUserDataUseCaseResult = Either<
  ResourceNotFoundError,
  ExportUserDataUseCaseResponse
>;

@Injectable()
export class ExportUserDataUseCase implements UseCase<
  ExportUserDataUseCaseRequest,
  ExportUserDataUseCaseResult
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    params: ExportUserDataUseCaseRequest,
  ): Promise<ExportUserDataUseCaseResult> {
    const data = await this.usersRepository.findByIdWithAllData(
      params.requesterId,
    );

    if (!data) {
      return failure(new ResourceNotFoundError('User not found'));
    }

    return success(data);
  }
}
