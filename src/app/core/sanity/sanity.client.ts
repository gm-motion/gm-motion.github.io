import { createClient } from '@sanity/client';
import { environment } from '../../../environments/environment';

export const sanityClient = createClient({
  projectId: environment.sanity.projectId,
  dataset: environment.sanity.dataset,
  apiVersion: environment.sanity.apiVersion,
  useCdn: environment.sanity.useCdn,
});
