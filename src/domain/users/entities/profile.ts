import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';

type ProfileProps = {
  userId: UniqueEntityID;
  username: string;
  displayName: string;
  bio: string;
  country: string;
  avatarUrl: string | null;
  points: number;
  totalPaid: number;
  createdAt: Date;
  updatedAt?: Date | null;
};

export class Profile extends Entity<ProfileProps> {
  get userId() {
    return this.props.userId;
  }

  get username() {
    return this.props.username;
  }

  get displayName() {
    return this.props.displayName;
  }

  get bio() {
    return this.props.bio;
  }

  get country() {
    return this.props.country;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get points() {
    return this.props.points;
  }

  get totalPaid() {
    return this.props.totalPaid;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(
    props: Optional<
      ProfileProps,
      'bio' | 'country' | 'avatarUrl' | 'points' | 'totalPaid' | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    return new Profile(
      {
        bio: '',
        country: '',
        avatarUrl: null,
        points: 0,
        totalPaid: 0,
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
