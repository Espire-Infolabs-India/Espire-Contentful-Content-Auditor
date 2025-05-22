import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  Flex,
  Select
} from '@contentful/f36-components';
import { useState } from 'react';
import { DeleteIcon, ChevronDownIcon } from '@contentful/f36-icons';
import PaginationWithTotalAndViewPerPageExample from '../../locations/PaginationWithTotal';


type Props = {
  entries: any[];
  onDeleteSelected: (entryIds: string[]) => void;
};

const UnusedEntriesTable = ({ entries, onDeleteSelected }: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (checked: boolean, entryId: string) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, entryId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== entryId));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.length > 0) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]); // Clear selection after delete
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = entries.map((entry) => entry.sys.id);
      setSelectedIds(allIds); // Select all entries
    } else {
      setSelectedIds([]); // Deselect all entries
    }
  };

  return (
    <>
      <Flex justifyContent="space-between" marginBottom="spacingM">
        <Select
          id="optionSelect-controlled"
          name="optionSelect-controlled"
          value="Sort by"
          className='mb'
          size="medium"
    >
          <Select.Option value="optionOne"> 
 Sort by</Select.Option>
        </Select>
        
      </Flex>
      <Flex justifyContent="space-between" marginBottom="spacingM">
        <Button
          variant="negative"
          isDisabled={selectedIds.length === 0}
          onClick={handleDeleteClick}
        >
        <span className="flex-design align-item-center"><DeleteIcon size="small" />  Delete Selected</span>
        </Button>

      </Flex>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableCell>  <Checkbox
          isChecked={selectedIds.length === entries.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          aria-label="Select All"
        >
          Select All
        </Checkbox>  </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Content Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.sys.id}>
              <TableCell>
                <Checkbox
                  isChecked={selectedIds.includes(entry.sys.id)}
                  onChange={(e) => toggleSelect(e.target.checked, entry.sys.id)}
                  aria-label={`Select ${entry.sys.id}`}
                />
              </TableCell>
              <TableCell>{entry.sys.id}</TableCell>
              <TableCell>{entry.sys.contentType.sys.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       <PaginationWithTotalAndViewPerPageExample />
    </>
  );
};

export default UnusedEntriesTable;
