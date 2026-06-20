import {
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetPublicUserPaymentsUseCase } from '#domain/payments/use-cases/get-public-user-payments.use-case.js';
import { PaymentPresenter } from '../presenters/payment.presenter.js';
import {
  GetPublicPaymentsQueryDto,
  UsernameParamDto,
} from '../schemas/get-payments.schema.js';
import { PaymentsResponseDto } from '../schemas/payments-response.schema.js';

@ApiTags('Payments')
@Controller({
  path: 'users',
  version: '1',
})
export class GetPublicUserPaymentsController {
  constructor(
    private readonly getPublicUserPaymentsUseCase: GetPublicUserPaymentsUseCase,
  ) {}

  @Get(':username/payments')
  @AllowAnonymous()
  @ApiOperation({ summary: "Get a public user's recent payment history" })
  @ApiOkResponse({
    description: 'Payment list returned.',
    type: PaymentsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'User has disabled activity visibility.',
    type: ErrorResponseDto,
  })
  @ApiParam({ name: 'username', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  async handle(
    @Param() params: UsernameParamDto,
    @Query() query: GetPublicPaymentsQueryDto,
  ) {
    const result = await this.getPublicUserPaymentsUseCase.execute({
      username: params.username,
      limit: query.limit,
      cursor: query.cursor,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      if (result.value instanceof NotAllowedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return {
      payments: result.value.payments.map(PaymentPresenter.present),
      nextCursor: result.value.nextCursor,
    };
  }
}
