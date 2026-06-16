export interface UseCase<request, response> {
  execute(params: request): Promise<response>;
}
