import { createClient } from 'contentful-management';

export const generateUnusedContentTypesReport = async (
  accessToken: string,
  spaceId: string,
  environmentId: string
): Promise<any[]> => {
  const client = createClient({ accessToken });

  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);
  const contentTypes = await environment.getContentTypes();

  const unusedContentTypes: any[] = [];

  for (const ct of contentTypes.items) {
    const entries = await environment.getEntries({ content_type: ct.sys.id, limit: 1 });
    if (entries.items.length === 0) {
      unusedContentTypes.push(ct);
    }
  }

  return unusedContentTypes;
};
