import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetUserPaymentsUseCase } from '#domain/payments/use-cases/get-user-payments.use-case.js';
import { PaymentPresenter } from '../presenters/payment.presenter.js';
import { GetPaymentsQueryDto } from '../schemas/get-payments.schema.js';
import { PaymentsResponseDto } from '../schemas/payments-response.schema.js';

@ApiTags('Payments')
@Controller({
  path: 'users',
  version: '1',
})
export class GetUserPaymentsController {
  constructor(
    private readonly getUserPaymentsUseCase: GetUserPaymentsUseCase,
  ) {}

  @Get('me/payments')
  @ApiOperation({ summary: "Get the authenticated user's payment history" })
  @ApiOkResponse({
    description: 'Payment list returned.',
    type: PaymentsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Profile not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  async handle(
    @Session() session: UserSession,
    @Query() query: GetPaymentsQueryDto,
  ) {
    const result = await this.getUserPaymentsUseCase.execute({
      userId: new UniqueEntityID(session.user.id),
      limit: query.limit,
      cursor: query.cursor,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return {
      payments: result.value.payments.map(PaymentPresenter.present),
      nextCursor: result.value.nextCursor,
    };
  }
}
