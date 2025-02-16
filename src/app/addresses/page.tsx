import { Metadata } from "next";

import { ADDRESSES } from "@/lib/consts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Marginfi Search - Addresses",
  description: "Search for marginfi addresses",
};

export default async function AddressesSearchPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 pb-8 pt-16">
      <h1 className="text-3xl">Common marginfi addresses</h1>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="rounded-tl-lg">Description</TableHead>
            <TableHead className="rounded-tr-lg">Public Key</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ADDRESSES.map((address, index) => (
            <TableRow
              key={index}
              className="even:bg-muted/50 hover:bg-transparent even:hover:bg-muted/50"
            >
              <TableCell>{address.description}</TableCell>
              <TableCell>
                {Array.isArray(address.publicKey) ? (
                  <ul>
                    {address.publicKey.map((key, i) => (
                      <li key={i}>{key}</li>
                    ))}
                  </ul>
                ) : (
                  address.publicKey
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
