import { getContentfulEnvironment } from './contentfulClient';

export const fetchUnusedEntries = async (
  accessToken: string,
  spaceId: string,
  environmentId: string
) => {
  const env = await getContentfulEnvironment(accessToken, spaceId, environmentId);
  const entries = await env.getEntries({ limit: 1000 });

  const referencedIds = new Set<string>();

  for (const entry of entries.items) {
    const fields = entry.fields;

    for (const fieldName in fields) {
      const fieldLocales = fields[fieldName];

      for (const locale in fieldLocales) {
        const value = fieldLocales[locale];

        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item?.sys?.type === 'Link' && item.sys.linkType === 'Entry') {
              referencedIds.add(item.sys.id);
            }
          });
        } else if (value?.sys?.type === 'Link' && value.sys.linkType === 'Entry') {
          referencedIds.add(value.sys.id);
        }
      }
    }
  }

  return entries.items.filter(
    (entry) =>
      !referencedIds.has(entry.sys.id) &&
      !entry.sys.contentType.sys.id.toLowerCase().includes('page') 
  );
};
