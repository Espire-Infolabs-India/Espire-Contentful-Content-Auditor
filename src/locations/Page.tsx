import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Heading,
  Flex,
  Paragraph,
  Select,
  Checkbox,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { generateReport } from "../lib/generateReport";
import { deleteEntries } from "../lib/deleteEntries";
import { getSpaceDetails } from "../lib/getSpaceDetails";
import { getCmaToken } from "../lib/getAppParameters";
import { fetchContentTypes } from "../lib/fetchContentTypes";
import { generateMediaReport } from "../lib/generateMediaReport";
import { deleteAssets } from "../lib/deleteAssets";
import UnusedEntriesTable from "../components/Reports/UnusedEntriesTable";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [unusedEntries, setUnusedEntries] = useState<any[]>([]);
  const [unusedMedia, setUnusedMedia] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [selectedContentType, setSelectedContentType] = useState("");
  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  useEffect(() => {
    const initializeApp = async () => {
      const { spaceId, environmentId, spaceName } = await getSpaceDetails(sdk);
      setSpaceId(spaceId);
      setEnvironmentId(environmentId);
      setSpaceName(spaceName);
      const token = getCmaToken(sdk);
      if (token) setAccessToken(token);
    };
    initializeApp();
  }, [sdk]);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!accessToken || !spaceId || !environmentId) return;

      setFetchingTypes(true);
      try {
        const data = await fetchContentTypes(spaceId, environmentId, accessToken);
        setContentTypes(data.items);
        if (data.items.length > 0) {
          setSelectedContentType(data.items[0].sys.id);
        }
      } catch (err) {
        console.error("Failed to fetch content types", err);
      }
      setFetchingTypes(false);
    };
    fetchTypes();
  }, [accessToken, spaceId, environmentId]);

  const handleGenerateReport = () => {
    if (!spaceId || !environmentId || !accessToken || !selectedContentType) return;

    // Clear media report and selection
    setUnusedMedia([]);
    setSelectedAssets([]);

    generateReport(
      accessToken,
      spaceId,
      environmentId,
      setUnusedEntries,
      setLoading,
      setHasGenerated,
      selectedContentType
    );
  };

  const handleGenerateMediaReport = () => {
    if (!spaceId || !environmentId || !accessToken) return;

    setLoading(true);
    setHasGenerated(false);

    // Clear entry report
    setUnusedEntries([]);

    generateMediaReport(
      accessToken,
      spaceId,
      environmentId,
      (assets) => {
        setUnusedMedia(assets);
        setLoading(false);
        setHasGenerated(true); // Set after media report is generated
      },
      setLoading,
      setHasGenerated
    );
  };

  const handleDeleteEntries = (entryIds: string[]) => {
    deleteEntries(entryIds, accessToken, spaceId, environmentId, handleGenerateReport);
  };

  const handleDeleteAssets = () => {
    deleteAssets(selectedAssets, accessToken, spaceId, environmentId, () => {
      setSelectedAssets([]);
      handleGenerateMediaReport();
    });
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  return (
    <Flex flexDirection="column" padding="spacingL" gap="spacingM">
      <Heading>Unused Entries Report</Heading>
      <Paragraph>
        <strong>Current Space ID:</strong> {spaceId} <br />
        <strong>Current Space Name:</strong> {spaceName} <br />
        <strong>Current Environment ID:</strong> {environmentId}
      </Paragraph>

      {fetchingTypes ? (
        <Spinner size="medium" />
      ) : (
        contentTypes.length > 0 && (
          <Select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
          >
            {contentTypes.map((ct) => (
              <Select.Option key={ct.sys.id} value={ct.sys.id}>
                {ct.name || ct.displayField || ct.sys.id}
              </Select.Option>
            ))}
          </Select>
        )
      )}

      <Flex gap="spacingS">
        <Button
          variant="primary"
          onClick={handleGenerateReport}
          isLoading={loading}
          isDisabled={!accessToken || !selectedContentType}
        >
          Generate Report
        </Button>
        <Button
          variant="secondary"
          onClick={handleGenerateMediaReport}
          isLoading={loading}
          isDisabled={!accessToken}
        >
          Generate Media Report
        </Button>
      </Flex>

      {loading && <Spinner size="large" />}

      {!loading && hasGenerated && unusedEntries.length === 0 && unusedMedia.length === 0 && (
        <Paragraph>🎉 No unused entries or media found!</Paragraph>
      )}

      {unusedEntries.length > 0 ? (
        <UnusedEntriesTable
          entries={unusedEntries}
          onDeleteSelected={handleDeleteEntries}
        />
      ) : unusedMedia.length > 0 ? (
        <>
          <Heading as="h3">Unused Media Items</Heading>
          <Flex flexDirection="column" gap="spacingXs">
            {unusedMedia.map((asset) => (
              <Checkbox
                key={asset.sys.id}
                isChecked={selectedAssets.includes(asset.sys.id)}
                onChange={() => toggleAssetSelection(asset.sys.id)}
              >
                {asset.fields?.title?.["en-US"] || asset.sys.id}
              </Checkbox>
            ))}
          </Flex>
          <Flex marginTop="spacingS">
            <Button
              variant="negative"
              onClick={handleDeleteAssets}
              isDisabled={selectedAssets.length === 0}
            >
              Delete Selected Media
            </Button>
          </Flex>
        </>
      ) : null}
    </Flex>
  );
};

export default Page;
