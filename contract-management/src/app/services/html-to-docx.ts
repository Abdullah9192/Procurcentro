declare module "html-to-docx" {
  export interface HtmlToDocxOptions {
    title?: string;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  function htmlToDocx(html: string, options?: HtmlToDocxOptions): Promise<Buffer>;

  export default htmlToDocx;
}
