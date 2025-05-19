import { useState } from "react";
import {
 Pagination
} from '@contentful/f36-components';

const PaginationWithTotalAndViewPerPageExample = () => {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleViewPerPageChange = (i:number) => {
    // Reset page to match item being shown on new View per page
    setPage(Math.floor((itemsPerPage * page + 1) / i));
    setItemsPerPage(i);
  };

  return (
    <Pagination
    className="mt-4"
      activePage={page}
      onPageChange={setPage}
      totalItems={113}
      showViewPerPage
      viewPerPageOptions={[20, 50, 100]}
      itemsPerPage={itemsPerPage}
      onViewPerPageChange={handleViewPerPageChange}
    />
  );
}

export default PaginationWithTotalAndViewPerPageExample;