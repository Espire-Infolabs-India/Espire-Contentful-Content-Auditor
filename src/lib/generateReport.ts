// lib/generateReport.ts
import { fetchUnusedEntries } from './fetchUnusedEntries';

export const generateReport = async (
  accessToken: string,
  spaceId: string,
  environmentId: string,
  setUnusedEntries: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setHasGenerated: React.Dispatch<React.SetStateAction<boolean>>,
  selectedContentType: string
) => {
  setLoading(true);
  setHasGenerated(true);

  try {
    const unused = await fetchUnusedEntries(
      accessToken,
      spaceId,
      environmentId,
      selectedContentType
    );
    setUnusedEntries(unused);
  } catch (error) {
    console.error('Error generating report:', error);
  }

  setLoading(false);
};
