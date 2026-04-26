// src/app/core/sanity/sanity-content.service.ts
import { Injectable } from '@angular/core';

import { sanityClient } from './sanity.client';
import { AboutData } from '../models/sanity/aboutPage';
import { HeaderFooterData } from '../models/sanity/headerFooter';
import { HomeData } from '../models/sanity/homePage';
import { WorkData } from '../models/sanity/workPage';
import { GfxProjectThumbnail } from '../models/sanity/commonSchemas';
import { GfxProject } from '../models/sanity/gfxProjectPage';

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
        },
        aspirationParagraphs[]{text},
        mentors[]{
          name,
          company,
          title,
          description,
          headshot {
            asset->{
              url
            },
            alt
          },
        }
    }`;

    return sanityClient.fetch<AboutData | null>(query);
  }

  async getWorkPage(): Promise<WorkData | null> {
    const workPageQuery = `*[_type == "workPage"][0]{
        gfxSubHeader,
        photoVideoParagraph,
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

    const gfxProjectsQuery = `*[_type == "gfxProject"] | order(_createdAt desc){
      title,
      "route": "/gfx-work/" + slug.current,
      thumbnail{
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
    }`;

    const [workPage, gfxProjects] = await Promise.all([
      sanityClient.fetch<WorkData | null>(workPageQuery),
      sanityClient.fetch<GfxProjectThumbnail[]>(gfxProjectsQuery),
    ]);

    if (!workPage) return null;

    return {
      ...workPage,
      gfxProjects,
    };
  }

  async getWorkProjectBySlug(slug: string): Promise<GfxProject | null> {
    const query = `*[_type == "gfxProject" && slug.current == $slug][0]{
      title,
      subheader,
      "slug": slug.current,
      thumbnail{
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
      sections[]{
        subheader,
        banner{
          asset->{
            url
          },
          alt
        },
        paragraphs,
        columns,
        mediaHeader,
        mediaItems[]{
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

    return sanityClient.fetch<GfxProject | null>(query, { slug });
  }

  async getHomePage(): Promise<HomeData | null> {
    const homePageQuery = `*[_type == "homePage"][0]{
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

    const gfxProjectsQuery = `*[_type == "gfxProject"] 
    | order(_createdAt desc)[0...3]{
      title,
      "route": "/gfx-work/" + slug.current,
      thumbnail{
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
    }`;

    const [homePage, gfxProjects] = await Promise.all([
      sanityClient.fetch<HomeData|null>(homePageQuery),
      sanityClient.fetch<GfxProjectThumbnail[]>(gfxProjectsQuery),
    ]);

    return {
      ...homePage,
      gfxProjects,
    };
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
