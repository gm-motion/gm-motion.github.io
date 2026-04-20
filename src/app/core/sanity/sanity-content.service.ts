// src/app/core/sanity/sanity-content.service.ts
import { Injectable } from '@angular/core';

import { sanityClient } from './sanity.client';
import { AboutData } from '../models/sanity/aboutPage';
import { HeaderFooterData } from '../models/sanity/headerFooter';
import { HomeData } from '../models/sanity/homePage';
import { WorkData } from '../models/sanity/workPage';

@Injectable({
  providedIn: 'root',
})
export class SanityContentService {
  async getAboutPage(): Promise<AboutData | null> {
    const query = `*[_type == "aboutPage" && _id == "aboutPage"][0]{
        headshot{
            asset->{url},
            alt
        },
        aboutInfoParagraphs[]{text},
          timelineItems[]{
          company,
          title,
          date,
          logo{
            asset->{
              url
            },
            alt
          },
          milestones[]{
            date,
            title,
            description,
            route
          }
        }
    }`;

    return sanityClient.fetch<AboutData | null>(query);
  }

  async getWorkPage(): Promise<WorkData | null> {
    const query = `*[_type == "workPage"][0]{
      gfxSubHeader,
      photoVideoParagraph,
      gfxWorkMedia[]{
        route,
        video{
          sourceType,
          provider,
          url,
          name,
          description,
          videoFile{
            asset->{
              url
            }
          }
        }
      },
      photoVideoMedia[]{
        media{
          mediaType,
          alt,
          video{
            sourceType,
            provider,
            url,
            name,
            description,
            videoFile{
              asset->{
                url
              }
            }
          },
          image{
            asset->{
              url
            }
          }
        }
      }
    }`;

    return sanityClient.fetch<WorkData | null>(query);
  }

  async getHomePage(): Promise<HomeData | null> {
    const query = `*[_type == "homePage"][0]{
      titleVideo{
        sourceType,
        provider,
        url,
        name,
        description,
        videoFile{
          asset->{
            url
          }
        }
      },
      headQuote,
      headParagraphs[]{text},
      videoStack[]{
        sourceType,
        provider,
        url,
        name,
        description,
        videoFile{
          asset->{
            url
          }
        }
      },
      gfxWorkSection[]{
        route,
        video{
          sourceType,
          provider,
          url,
          name,
          description,
          videoFile{
            asset->{
              url
            }
          }
        }
      },
      partneredClientsSection[]{
        client,
        img{
          asset->{
            url
          },
          alt
        }
      }
    }`;

    return sanityClient.fetch<HomeData | null>(query);
  }

  async getHeaderFooter(): Promise<HeaderFooterData | null> {
    const query = `*[_type == "headerFooter"][0]{
    footerHeader,
    footerParagraph,
    logoLight{
      asset->{
        url
      },
      alt
    },
    logoDark{
      asset->{
        url
      },
      alt
    },
    footerSocials[]{
      label,
      socialLink,
      icon{
        asset->{
          url
        },
        alt
      }
    }
  }`;

    return sanityClient.fetch<HeaderFooterData | null>(query);
  }
}
