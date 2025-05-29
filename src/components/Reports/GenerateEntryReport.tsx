import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  Flex,
  Select,
  Badge,
} from "@contentful/f36-components";
import { useState } from "react";
import { DeleteIcon } from "@contentful/f36-icons";
import PaginationControl from "../../locations/PaginationWithTotal";
import {
  format,
  isToday,
  isYesterday,
  isFuture,
  formatDistanceToNow,
} from "date-fns";

const statusColorMap: Record<
  string,
  "positive" | "warning" | "primary" | "negative" | "secondary"
> = {
  published: "positive",
  changed: "primary",
  draft: "warning",
  archived: "secondary",
};

const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

type Props = {
  entries: any[];
  onDeleteSelected: (entryIds: string[]) => void;
  page: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  searchQuery: string;
};

const GenerateEntryReport = ({
  entries,
  onDeleteSelected,
  page,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  searchQuery,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (checked: boolean, entryId: string) => {
    setSelectedIds(
      checked
        ? [...selectedIds, entryId]
        : selectedIds.filter((id) => id !== entryId)
    );
  };

  const handleDeleteClick = () => {
    if (selectedIds.length > 0) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSelectAll = (checked: boolean, paginatedIds: string[]) => {
    setSelectedIds(
      checked
        ? [...new Set([...selectedIds, ...paginatedIds])]
        : selectedIds.filter((id) => !paginatedIds.includes(id))
    );
  };

  const getDisplayName = (entry: any): string => {
    if (!entry?.fields) return entry?.sys?.id;
    for (const key in entry?.fields) {
      const value = entry?.fields[key];
      if (typeof value === "string") return value;
      if (typeof value === "object" && value?.["en-US"]) return value["en-US"];
    }
    return entry?.sys?.id;
  };

  const filteredEntries = entries.filter((entry) => {
    const name = getDisplayName(entry).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const paginatedEntries = filteredEntries.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const paginatedIds = paginatedEntries.map((e) => e.sys.id);

  return (
    <>
      <Flex justifyContent="space-between" marginBottom="spacingM">
        <Select
          id="optionSelect-controlled"
          name="optionSelect-controlled"
          value="Sort by"
          className="mb"
          size="medium"
        >
          <Select.Option value="optionOne">Sort by</Select.Option>
        </Select>
      </Flex>
      <Flex justifyContent="space-between" marginBottom="spacingM">
        <Button
          variant="negative"
          isDisabled={selectedIds.length === 0}
          onClick={handleDeleteClick}
        >
          <span className="flex-design align-item-center">
            <DeleteIcon size="small" /> Delete Selected
          </span>
        </Button>
      </Flex>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                isChecked={paginatedIds.every((id) => selectedIds.includes(id))}
                onChange={(e) =>
                  handleSelectAll(e.target.checked, paginatedIds)
                }
                aria-label="Select All"
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Content Type</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedEntries.map((entry) => (
            <TableRow key={entry?.sys?.id}>
              <TableCell>
                <Checkbox
                  isChecked={selectedIds.includes(entry?.sys?.id)}
                  onChange={(e) =>
                    toggleSelect(e?.target?.checked, entry?.sys?.id)
                  }
                  aria-label={`Select ${entry?.sys?.id}`}
                />
              </TableCell>
              <TableCell>{getDisplayName(entry)}</TableCell>
              <TableCell>{entry?.sys?.contentType?.sys?.id}</TableCell>
              <TableCell>
                {entry?.sys?.updatedAt
                  ? (() => {
                      const date = new Date(entry?.sys?.updatedAt);
                      if (isFuture(date))
                        return formatDistanceToNow(date, { addSuffix: true });
                      if (isToday(date))
                        return `Today at ${format(date, "h:mm a")}`;
                      if (isYesterday(date))
                        return `Yesterday at ${format(date, "h:mm a")}`;
                      return format(date, "dd MMM yyyy");
                    })()
                  : "—"}
              </TableCell>
              <TableCell>
                {(() => {
                  const statusRaw = entry?.sys?.archivedAt
                    ? "archived"
                    : entry.sys?.fieldStatus?.["*"]?.["en-US"] || "draft";
                  const status = capitalizeFirst(statusRaw);
                  const variant = statusColorMap[statusRaw] ?? "default";
                  return <Badge variant={variant}>{status}</Badge>;
                })()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControl
        page={page}
        itemsPerPage={itemsPerPage}
        totalItems={filteredEntries.length}
        onPageChange={onPageChange}
        onViewPerPageChange={(i) => {
          onPageChange(Math.floor((itemsPerPage * page + 1) / i));
          onItemsPerPageChange(i);
        }}
      />
    </>
  );
};

export default GenerateEntryReport;
