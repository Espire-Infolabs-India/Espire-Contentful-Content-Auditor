import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Heading,
  Flex,
  Paragraph,
  Select,
  Checkbox,
  Text,
  Box,
  TextInput
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { generateReport } from "../lib/generateReport";
import { generateMediaReport } from "../lib/generateMediaReport";
import { deleteAssets } from "../lib/deleteAssets";
import { generateUnusedContentTypesReport } from "../lib/generateUnusedContentTypesReport";
import { getSpaceDetails } from "../lib/getSpaceDetails";
import { getCmaToken } from "../lib/getAppParameters";
import { fetchContentTypes } from "../lib/fetchContentTypes";
import UnusedEntriesTable from "../components/Reports/UnusedEntriesTable";
import { deleteEntries } from "../lib/deleteEntries";
import  '../styles/global.css';
import NotFound from "./NotFound";
import { PageIcon, AssetIcon, FolderOpenIcon } from '@contentful/f36-icons';


const Page = () => {
  const sdk = useSDK<PageAppSDK>();

  const [accessToken, setAccessToken] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [selectedContentType, setSelectedContentType] = useState("");
  const [fetchingTypes, setFetchingTypes] = useState(false);

  const [unusedEntries, setUnusedEntries] = useState<any[]>([]);
  const [unusedMedia, setUnusedMedia] = useState<any[]>([]);
  const [unusedContentTypes, setUnusedContentTypes] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const [loadingState, setLoadingState] = useState<"entries" | "media" | "types" | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [isGeneratingEntryReport, setIsGeneratingEntryReport] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { spaceId, environmentId, spaceName } = await getSpaceDetails(sdk);
      setSpaceId(spaceId);
      setEnvironmentId(environmentId);
      setSpaceName(spaceName);

      const token = getCmaToken(sdk);
      if (token) setAccessToken(token);
    };
    initialize();
  }, [sdk]);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!accessToken || !spaceId || !environmentId) return;

      setFetchingTypes(true);
      try {
        const data = await fetchContentTypes(spaceId, environmentId, accessToken);
        setContentTypes(data.items);
        if (data.items.length > 0) setSelectedContentType(data.items[0].sys.id);
      } catch (err) {
        console.error("Failed to fetch content types", err);
      } finally {
        setFetchingTypes(false);
      }
    };
    fetchTypes();
  }, [accessToken, spaceId, environmentId]);

  const resetReports = () => {
    setUnusedEntries([]);
    setUnusedMedia([]);
    setUnusedContentTypes([]);
    setHasGenerated(false);
  };

  const handleGenerateMediaReport = async () => {
    if (!spaceId || !environmentId || !accessToken) return;

    resetReports();
    setLoadingState("media");

    try {
      await generateMediaReport(
        accessToken,
        spaceId,
        environmentId,
        setUnusedMedia,
        () => setHasGenerated(true)
      );
    } catch (error) {
      console.error("Error generating media report:", error);
    } finally {
      setLoadingState(null);
    }
  };

  const handleGenerateUnusedContentTypeReport = async () => {
    if (!accessToken || !spaceId || !environmentId) return;

    resetReports();
    setLoadingState("types");

    try {
      const result = await generateUnusedContentTypesReport(accessToken, spaceId, environmentId);
      setUnusedContentTypes(result);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating unused content types report:", error);
    } finally {
      setLoadingState(null);
    }
  };

  const handleDeleteEntries = (entryIds: string[]) => {
    deleteEntries(entryIds, accessToken, spaceId, environmentId, () => {
      setUnusedEntries([]);
      setHasGenerated(false);
    });
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

  const handleEntryReportSelect = async (contentTypeId: string) => {
    setSelectedContentType(contentTypeId);
    setIsGeneratingEntryReport(true);
    setLoadingState("entries");
    resetReports();

    try {
      await generateReport(
        accessToken,
        spaceId,
        environmentId,
        setUnusedEntries,
        () => setHasGenerated(true),
        contentTypeId
      );
    } catch (error) {
      console.error("Error generating entry report:", error);
    } finally {
      setIsGeneratingEntryReport(false);
      setLoadingState(null);
      setShowContentTypeDropdown(false);
    }
  };

  return (
    <Flex flexDirection="column" gap="spacingM">
      <Heading className="hidden">Unused Entries Report</Heading>
      <Paragraph className="hidden">
        <strong>Current Space ID:</strong> {spaceId}<br />
        <strong>Current Space Name:</strong> {spaceName}<br />
        <strong>Current Environment ID:</strong> {environmentId}
      </Paragraph>

    <Box className="flex-design flex-direction-row">
      <Flex gap="spacing2Xs" className="flex-design flex-direction left-side-menu flex-item-left border-right">
        <Button
          variant="primary"
          onClick={() => {
            setShowContentTypeDropdown(true);
            resetReports();
          }}
          isDisabled={!accessToken || loadingState !== null}
        >
         <span className="flex-design align-item-center"><PageIcon size="small" /> Generate Entry Report</span>
        </Button>
        <Button
          variant="secondary"
          onClick={handleGenerateMediaReport}
          isLoading={loadingState === "media"}
          isDisabled={!accessToken || loadingState !== null}
        >
         <span className="flex-design align-item-center"><AssetIcon size="small" /> Generate Media Report</span>
        </Button>
        <Button
          variant="secondary"
          onClick={handleGenerateUnusedContentTypeReport}
          isLoading={loadingState === "types"}
          isDisabled={!accessToken || loadingState !== null}
        >
        <span className="flex-design align-item-center"><FolderOpenIcon size="small" /> Generate Unused Content Types Report</span> 
        </Button>
      </Flex>

          <Box className="flex-item-right">
      {contentTypes && !fetchingTypes && contentTypes.length > 0 && (
       <Flex flexDirection="column" gap="spacingXs" alignItems="flex-start" >
          <Heading className="h1">Generate Entry Report</Heading>
          
          <Flex className="border content-type-wrap mb">
            <Box className="content-type-box">Content Type</Box>
          <Select
            value={selectedContentType}
            isDisabled={isGeneratingEntryReport}
            onChange={(e) => handleEntryReportSelect(e.target.value)}
            className="selectbox"
           
          >
            {contentTypes.map((ct) => (
              <Select.Option key={ct.sys.id} value={ct.sys.id}>
                {ct.name || ct.displayField || ct.sys.id}
              </Select.Option>
            ))}
          </Select>
          <TextInput
          size="medium"
          className="type-search"
        placeholder="Type to search for entries"
      />
           </Flex>
          {isGeneratingEntryReport && <Spinner size="medium" />}
           
        </Flex>
        
        
      )}
      
      {!loadingState && hasGenerated &&
        unusedEntries.length === 0 &&
        unusedMedia.length === 0 &&
        unusedContentTypes.length === 0 && (
        <Paragraph>🎉 No unused entries, media, or content types found!</Paragraph>
      )}

      {unusedEntries.length > 0 ? (
        <UnusedEntriesTable entries={unusedEntries} onDeleteSelected={handleDeleteEntries} />
      ) : <NotFound />}

      {unusedMedia.length > 0 && (
        <>
          <Heading as="h3">Unused Media Items</Heading>
          <Box style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "8px" }}>
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
          </Box>
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
          <Flex flexDirection="column" gap="spacingXs">
            {unusedContentTypes.map((ct) => (
              <Text key={ct.sys.id}>
                {ct.name || ct.displayField || ct.sys.id}
              </Text>
            ))}
          </Flex>
        </>
      )}
      </Box>
      </Box>
    </Flex>
    
  );
};

export default Page;
