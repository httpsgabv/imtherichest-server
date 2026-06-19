import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';

type PaymentProps = {
  profileId: UniqueEntityID;
  amount: number; // in cents
  points: number; // Math.round(amount / 100)
  createdAt: Date;
};

export class Payment extends Entity<PaymentProps> {
  get profileId() {
    return this.props.profileId;
  }

  get amount() {
    return this.props.amount;
  }

  get points() {
    return this.props.points;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<PaymentProps, 'points' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Payment(
      {
        points: Math.round(props.amount / 100),
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
