import { SanityImage } from './commonSchemas';

export interface FooterSocial {
  label: string;
  socialLink: string;
  icon?: SanityImage;
}

export interface HeaderFooterData {
  footerHeader?: string;
  footerParagraph?: string;
  logoLight?: SanityImage;
  logoDark?: SanityImage;
  footerSocials?: FooterSocial[];
}
