import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Heading,
  Flex,
  Paragraph,
  Select,
} from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { generateReport } from "../lib/generateReport";
import { deleteEntries } from "../lib/deleteEntries";
import { getSpaceDetails } from "../lib/getSpaceDetails";
import { getCmaToken } from "../lib/getAppParameters";
import { fetchContentTypes } from "../lib/fetchContentTypes";
import UnusedEntriesTable from "../components/Reports/UnusedEntriesTable";

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [unusedEntries, setUnusedEntries] = useState<any[]>([]);
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
        const data = await fetchContentTypes(
          spaceId,
          environmentId,
          accessToken
        );
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
    if (!spaceId || !environmentId || !accessToken || !selectedContentType)
      return;
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

  const handleDeleteEntries = (entryIds: string[]) => {
    deleteEntries(
      entryIds,
      accessToken,
      spaceId,
      environmentId,
      handleGenerateReport
    );
  };

  return (
    <Flex flexDirection="column" padding="spacingL" gap="spacingM">
      <Heading>Unused Entries Report</Heading>

      <Paragraph>
        <strong>Current Space ID:</strong> {spaceId} <br />
        <strong>Current Space Name :</strong> {spaceName} <br />
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

      <Button
        variant="primary"
        onClick={handleGenerateReport}
        isLoading={loading}
        isDisabled={!accessToken || !selectedContentType}
      >
        Generate Report
      </Button>

      {loading && <Spinner size="large" />}

      {!loading && hasGenerated && unusedEntries.length === 0 && (
        <Paragraph>🎉 No unused entries found!</Paragraph>
      )}

      {unusedEntries?.length > 0 && (
        <UnusedEntriesTable
          entries={unusedEntries}
          onDeleteSelected={handleDeleteEntries}
        />
      )}
    </Flex>
  );
};

export default Page;
