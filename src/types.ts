export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

export interface VisitApiError {
  status: number;
  title?: string;
  type?: string;
  errorCode?: string;
  errors?: Array<{
    description: string;
    error: string;
    field: string;
  }>;
}
