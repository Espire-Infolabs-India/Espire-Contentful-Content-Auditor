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
import { generateUnusedContentTypesReport } from "../lib/generateUnusedContentTypesReport";
import UnusedEntriesTable from "../components/Reports/UnusedEntriesTable";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [unusedEntries, setUnusedEntries] = useState<any[]>([]);
  const [unusedMedia, setUnusedMedia] = useState<any[]>([]);
  const [unusedContentTypes, setUnusedContentTypes] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<"entries" | "media" | "types" | null>(null);

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

    setUnusedMedia([]);
    setSelectedAssets([]);
    setUnusedContentTypes([]);
    setLoadingState("entries");

    generateReport(
      accessToken,
      spaceId,
      environmentId,
      setUnusedEntries,
      () => setHasGenerated(true),
      selectedContentType
    )
      .catch((error) => {
        console.error("Error generating report:", error);
      })
      .finally(() => setLoadingState(null));
  };

  const handleGenerateMediaReport = () => {
    if (!spaceId || !environmentId || !accessToken) return;

    setUnusedEntries([]);
    setUnusedContentTypes([]);
    setLoadingState("media");
    setHasGenerated(false);

    generateMediaReport(
      accessToken,
      spaceId,
      environmentId,
      (assets) => {
        setUnusedMedia(assets);
        setHasGenerated(true);
      },
      () => setHasGenerated(true)
    )
      .catch((error) => {
        console.error("Error generating media report:", error);
      })
      .finally(() => setLoadingState(null));
  };

  const handleGenerateUnusedContentTypeReport = async () => {
    if (!accessToken || !spaceId || !environmentId) return;

    setUnusedEntries([]);
    setUnusedMedia([]);
    setLoadingState("types");
    setHasGenerated(false);
    try {
      const result = await generateUnusedContentTypesReport(
        accessToken,
        spaceId,
        environmentId
      );
      setUnusedContentTypes(result);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating unused content types report:", error);
    } finally {
      setLoadingState(null);
    }
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
      <Heading>Unused Content Report</Heading>
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
          isLoading={loadingState === "entries"}
          isDisabled={!accessToken || !selectedContentType || loadingState !== null}
        >
          Generate Entry Report
        </Button>
        <Button
          variant="secondary"
          onClick={handleGenerateMediaReport}
          isLoading={loadingState === "media"}
          isDisabled={!accessToken || loadingState !== null}
        >
          Generate Media Report
        </Button>
        <Button
          variant="secondary"
          onClick={handleGenerateUnusedContentTypeReport}
          isLoading={loadingState === "types"}
          isDisabled={!accessToken || loadingState !== null}
        >
          Unused Content Types
        </Button>
      </Flex>
      {loadingState && <Spinner size="large" />}
      {!loadingState && hasGenerated && unusedEntries.length === 0 && unusedMedia.length === 0 && unusedContentTypes.length === 0 && (
        <Paragraph>🎉 No unused entries, media, or content types found!</Paragraph>
      )}
      {unusedEntries.length > 0 && (
        <UnusedEntriesTable entries={unusedEntries} onDeleteSelected={handleDeleteEntries} />
      )}
      {unusedMedia.length > 0 && (
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
      )}
      {unusedContentTypes.length > 0 && (
        <>
          <Heading as="h3">Unused Content Types</Heading>
          <ul>
            {unusedContentTypes.map((ct) => (
              <li key={ct.sys.id}>{ct.name || ct.sys.id}</li>
            ))}
          </ul>
        </>
      )}
    </Flex>
  );
};

export default Page;
