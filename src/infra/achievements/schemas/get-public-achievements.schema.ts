import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UsernameParamSchema = z.object({
  username: z.string().min(2).max(30),
});

export class UsernameParamDto extends createZodDto(UsernameParamSchema) {}
