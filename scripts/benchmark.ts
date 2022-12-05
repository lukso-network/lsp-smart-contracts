import { Align, getMarkdownTable } from "markdown-table-ts";

const table = getMarkdownTable({
  table: {
    head: ["ID", "Name", "Age"],
    body: [
      ["1", "John", "26"],
      ["2", "Bob", "25"],
      ["3", "Alice", "23"],
    ],
  },
  alignment: [Align.Left, Align.Center, Align.Right],
});

console.log(table);
