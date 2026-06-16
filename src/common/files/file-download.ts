export class FileDownload {
  constructor(
    public readonly filename: string,
    public readonly mimeType: string,
    public readonly content: Buffer | string,
  ) {}
}
