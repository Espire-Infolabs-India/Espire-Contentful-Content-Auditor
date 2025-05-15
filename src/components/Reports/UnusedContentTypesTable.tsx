// src/components/Reports/UnusedContentTypesTable.tsx
import React from "react";
import { Table } from "@contentful/f36-components";

const UnusedContentTypesTable = ({ contentTypes }: { contentTypes: any[] }) => {
  return (
    <div>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Content Type Name</Table.Cell>
            <Table.Cell>Content Type ID</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {contentTypes.map((type) => (
            <Table.Row key={type.sys.id}>
              <Table.Cell>{type.name || type.sys.id}</Table.Cell>
              <Table.Cell>{type.sys.id}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default UnusedContentTypesTable;
