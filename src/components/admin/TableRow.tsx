type FieldMapping<T> = Record<string, keyof T>;
interface TableRowProps<T> {
  rowData: T;
  headers: string[];
  fieldMapping: FieldMapping<T>;
  onClick: () => void;
}

export default function TableRow<T extends Record<string, any>>({
  rowData,
  headers,
  fieldMapping,
  onClick,
}: TableRowProps<T>) {
  return (
    <tr
      className="text-xs border-b border-gray-300 cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      {headers.map((header) => (
        <td
          key={header}
          className="text-center py-1 px-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]"
          title={String(rowData[fieldMapping[header]])} // 마우스 오버 시 전체 내용 표시
        >
          {rowData[fieldMapping[header]] as React.ReactNode}
        </td>
      ))}
    </tr>
  );
}
