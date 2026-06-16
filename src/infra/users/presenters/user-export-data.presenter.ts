import type { UserExportData } from '#domain/users/repositories/users-repository.js';

export class UserExportDataPresenter {
  static present(data: UserExportData) {
    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        emailVerified: data.user.emailVerified,
        createdAt: data.user.createdAt.toISOString(),
        updatedAt: data.user.updatedAt?.toISOString() ?? null,
      },
    };
  }
}
