import { useEffect, useState } from 'react';
import {
  Button,
  Spinner,
  Heading,
  Flex,
  Paragraph,
} from '@contentful/f36-components';
import { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { generateReport, deleteEntries } from '../lib/reportAndDelete';
import UnusedEntriesTable from '../components/Reports/UnusedEntriesTable';

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const [unusedEntries, setUnusedEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const spaceId = sdk.ids.space;
  const environmentId = sdk.ids.environment;

  useEffect(() => {
    const fetchParams = async () => {
      const params = sdk.parameters;
      if (params?.installation?.cmaToken) {
        setAccessToken(params.installation.cmaToken);
      }
    };
    fetchParams();
  }, [sdk]);

  const handleGenerateReport = () => {
    if (!spaceId || !environmentId || !accessToken) return;

    generateReport(
      accessToken,
      spaceId,
      environmentId,
      setUnusedEntries,
      setLoading,
      setHasGenerated
    );
  };

  const handleDeleteEntries = (entryIds: string[]) => {
    deleteEntries(entryIds, accessToken, spaceId, environmentId, () =>
      handleGenerateReport()
    );
  };

  return (
    <Flex flexDirection="column" padding="spacingL" gap="spacingM">
      <Heading>Unused Entries Report</Heading>
      <Button
        variant="primary"
        onClick={handleGenerateReport}
        isLoading={loading}
        isDisabled={!accessToken}
      >
        Generate Report
      </Button>

      {loading && <Spinner size="large" />}

      {!loading && hasGenerated && unusedEntries.length === 0 && (
        <Paragraph>🎉 No unused entries found!</Paragraph>
      )}

      {unusedEntries.length > 0 && (
        <UnusedEntriesTable
          entries={unusedEntries}
          onDeleteSelected={handleDeleteEntries}
        />
      )}
    </Flex>
  );
};

export default Page;
