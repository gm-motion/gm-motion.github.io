// studio-gm-motion/structure.ts
import type {StructureResolver} from 'sanity/structure'

export const singletonTypes =
    new Set(['aboutPage', 'homePage', 'workPage', 'headerFooter'])
export const singletonActions =
    new Set(['publish', 'discardChanges', 'restore'])

export const structure: StructureResolver = (S) =>
    S.list().title('Content').items([
      S.listItem()
          .title('About Page')
          .id('aboutPage')
          .schemaType('aboutPage')
          .child(S.editor()
                     .id('aboutPage')
                     .schemaType('aboutPage')
                     .documentId('aboutPage')),

      S.listItem()
          .title('Home Page')
          .id('homePage')
          .schemaType('homePage')
          .child(S.editor()
                     .id('homePage')
                     .schemaType('homePage')
                     .documentId('homePage')),

      S.listItem()
          .title('Work Page')
          .id('workPage')
          .schemaType('workPage')
          .child(S.editor()
                     .id('workPage')
                     .schemaType('workPage')
                     .documentId('workPage')),

      S.listItem()
          .title('Header and Footer')
          .id('headerFooter')
          .schemaType('headerFooter')
          .child(S.editor()
                     .id('headerFooter')
                     .schemaType('headerFooter')
                     .documentId('headerFooter')),

      ...S.documentTypeListItems().filter(
          (listItem) => !singletonTypes.has(listItem.getId() ?? '')),
    ])
