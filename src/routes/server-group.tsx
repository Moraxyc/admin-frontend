import { swrFetcher } from "@/api/api"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import useSWR from "swr"
import { useEffect } from "react"
import { ActionButtonGroup } from "@/components/action-button-group"
import { HeaderButtonGroup } from "@/components/header-button-group"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ModelServerGroupResponseItem } from "@/types"
import { deleteServerGroups } from "@/api/server-group"
import { GroupTab } from "@/components/group-tab"
import { ServerGroupCard } from "@/components/server-group"

export default function ServerGroupPage() {
    const { data, mutate, error, isLoading } = useSWR<ModelServerGroupResponseItem[]>("/api/v1/server-group", swrFetcher);

    useEffect(() => {
        if (error)
            toast("Error", {
                description: `Error fetching resource: ${error.message}.`,
            })
    }, [error])

    const columns: ColumnDef<ModelServerGroupResponseItem>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            header: "ID",
            accessorKey: "id",
            accessorFn: row => row.group.id,
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => {
                const s = row.original;
                return (
                    <div className="max-w-48 whitespace-normal break-words">
                        {s.group.name}
                    </div>
                )
            }
        },
        {
            header: "Servers (ID)",
            accessorKey: "servers",
            accessorFn: row => row.servers,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const s = row.original
                return (
                    <ActionButtonGroup className="flex gap-2" delete={{
                        fn: deleteServerGroups,
                        id: s.group.id,
                        mutate: mutate,
                    }}>
                        <ServerGroupCard mutate={mutate} data={s} />
                    </ActionButtonGroup>
                )
            },
        },
    ]

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <div className="px-8">
            <div className="flex mt-6 mb-4">
                <GroupTab />
                <HeaderButtonGroup className="flex ml-auto gap-2" delete={{
                    fn: deleteServerGroups,
                    id: selectedRows.map(r => r.original.group.id),
                    mutate: mutate
                }}>
                    <ServerGroupCard mutate={mutate} />
                </HeaderButtonGroup>
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-[60px] w-[100%] rounded-lg" />
                    <Skeleton className="h-[60px] w-[100%] rounded-lg" />
                    <Skeleton className="h-[60px] w-[100%] rounded-lg" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-sm">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-xsm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
