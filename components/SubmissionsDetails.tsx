import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type Props = {
  submission: any;
  index: number;
};

const SubmissionsDetails: React.FC<Props> = ({ submission, index }) => {
  let content = submission?.content;

  // 🛠️ Ensure content is an object (Parse if it's a JSON string)
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch (error) {
      console.error("Error parsing content:", error);
      content = {};
    }
  }

  return (
    <div>
      <h1 className="font-bold text-2xl mb-4">Response - {index + 1}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Questions</TableHead>
            <TableHead>Answer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {content && typeof content === "object" ? (
            Object.entries(content).map(([key, value], index: number) => (
              <TableRow key={index}>
                <TableCell>{key}</TableCell>
                <TableCell>
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>Invalid submission data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionsDetails;
