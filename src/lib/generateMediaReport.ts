// lib/generateMediaReport.ts
export const generateMediaReport = async (
  accessToken: string,
  spaceId: string,
  environmentId: string,
  setUnusedAssets: (assets: any[]) => void,
  setHasGenerated: (generated: boolean) => void
) => {
  try {
    const assetsRes = await fetch(
      `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/assets`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const assetsData = await assetsRes.json();
    const allAssets = assetsData.items;

    const unusedAssets: any[] = [];

    for (const asset of allAssets) {
      const assetId = asset.sys.id;

      const usageRes = await fetch(
        `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?links_to_asset=${assetId}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const usageData = await usageRes.json();
      const isUsed = usageData.items?.length > 0;

      if (!isUsed) {
        unusedAssets.push(asset);
      }
    }
    setUnusedAssets(unusedAssets);
  } catch (error) {
    console.error("Error generating media report:", error);
    setUnusedAssets([]);
  }

  setHasGenerated(true);
};
