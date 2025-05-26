import {
  Flex,
  Box,
  Heading,
  Select,
  Spinner,
  TextInput,
} from "@contentful/f36-components";

type Props = {
  contentTypes: any[];
  selectedContentType: string;
  isGeneratingEntryReport: boolean;
  onSelectContentType: (id: string) => void;
};

const ContentTypeSelector = ({
  contentTypes,
  selectedContentType,
  isGeneratingEntryReport,
  onSelectContentType,
}: Props) => {
  if (!contentTypes || contentTypes.length === 0) return null;

  return (
    <Flex flexDirection="column" gap="spacingXs" alignItems="flex-start">
      <Heading className="h1">Unlinked Content Entries</Heading>
      <Flex className="border content-type-wrap mb">
        <Box className="content-type-box">Content Type</Box>
        <Select
          value={selectedContentType}
          isDisabled={isGeneratingEntryReport}
          onChange={(e) => onSelectContentType(e.target.value)}
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
  );
};

export default ContentTypeSelector;
