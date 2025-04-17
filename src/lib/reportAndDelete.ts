// lib/reportAndDelete.ts
import { createClient } from 'contentful-management';
import { fetchUnusedEntries } from './fetchUnusedEntries';

export const generateReport = async (
  accessToken: string,
  spaceId: string,
  environmentId: string,
  setUnusedEntries: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setHasGenerated: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading(true);
  setHasGenerated(true);

  try {
    const unused = await fetchUnusedEntries(accessToken, spaceId, environmentId);
    setUnusedEntries(unused);
  } catch (error) {
    console.error('Error generating report:', error);
  }

  setLoading(false);
};

export const deleteEntries = async (
    entryIds: string[],
    accessToken: string,
    spaceId: string,
    environmentId: string,
    generateReport: () => void
  ) => {
    try {
      const client = createClient({ accessToken });
      const space = await client.getSpace(spaceId);
      const env = await space.getEnvironment(environmentId);
  
      for (const entryId of entryIds) {
        const entry = await env.getEntry(entryId);
  

        if (entry.sys.publishedVersion) {
          await entry.unpublish();
          console.log(`Unpublished entry with ID: ${entryId}`);
        }
  
        // Now delete the entry
        await entry.delete();
        console.log(`Deleted entry with ID: ${entryId}`);
      }
  
      // Refresh unused entries after deletion
      generateReport();
    } catch (error) {
      console.error('Error deleting entries:', error);
    }
  };
  