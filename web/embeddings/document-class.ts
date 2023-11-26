export interface DocumentInput<
  Metadata extends Record<string, any> = Record<string, any>,
> {
  pageContent: string;
  metadata?: Metadata;
  user_id: string;
  project_id: string;
}

export class Document<
  Metadata extends Record<string, any> = Record<string, any>,
> implements DocumentInput
{
  pageContent: string;
  metadata: Metadata;
  user_id: string;
  project_id: string;

  constructor(fields: DocumentInput<Metadata>) {
    this.pageContent = fields.pageContent;
    this.metadata = fields.metadata;
    this.user_id = fields.user_id;
    this.project_id = fields.project_id;
  }
}
