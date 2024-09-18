'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Switch from '@mui/material/Switch';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Dropdown from '@/components/dropdown';
import IconDownload from '@/components/icon/icon-download';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ComponentsAppsSendMessage = () => {
    const [items, setItems] = useState([
        {
            id: 1,
            name: 'Laurie Fox',
            schedule: '10:00 AM - 11:00 AM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'John Doe',
            messages: 5,
            createdOn: '15 Dec 2020',
            startedOn: '16 Dec 2020',
            completedOn: '17 Dec 2020',
        },
        {
            id: 2,
            name: 'Alexander Gray',
            schedule: '11:00 AM - 12:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Jane Smith',
            messages: 3,
            createdOn: '20 Dec 2020',
            startedOn: '21 Dec 2020',
            completedOn: '22 Dec 2020',
        },
        {
            id: 3,
            name: 'James Taylor',
            schedule: '12:00 PM - 01:00 PM',
            status: { tooltip: 'Pending', color: 'danger' },
            receiver: 'Alice Johnson',
            messages: 2,
            createdOn: '27 Dec 2020',
            startedOn: '28 Dec 2020',
            completedOn: '29 Dec 2020',
        },
        {
            id: 4,
            name: 'Grace Roberts',
            schedule: '01:00 PM - 02:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Bob Brown',
            messages: 4,
            createdOn: '31 Dec 2020',
            startedOn: '01 Jan 2021',
            completedOn: '02 Jan 2021',
        },
        {
            id: 5,
            name: 'Donna Rogers',
            schedule: '02:00 PM - 03:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Charlie Davis',
            messages: 1,
            createdOn: '03 Jan 2021',
            startedOn: '04 Jan 2021',
            completedOn: '05 Jan 2021',
        },
        {
            id: 6,
            name: 'Michael Scott',
            schedule: '03:00 PM - 04:00 PM',
            status: { tooltip: 'Pending', color: 'danger' },
            receiver: 'Dwight Schrute',
            messages: 6,
            createdOn: '06 Jan 2021',
            startedOn: '07 Jan 2021',
            completedOn: '08 Jan 2021',
        },
        {
            id: 7,
            name: 'Pam Beesly',
            schedule: '04:00 PM - 05:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Jim Halpert',
            messages: 7,
            createdOn: '09 Jan 2021',
            startedOn: '10 Jan 2021',
            completedOn: '11 Jan 2021',
        },
        {
            id: 8,
            name: 'Stanley Hudson',
            schedule: '05:00 PM - 06:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Phyllis Vance',
            messages: 8,
            createdOn: '12 Jan 2021',
            startedOn: '13 Jan 2021',
            completedOn: '14 Jan 2021',
        },
        {
            id: 9,
            name: 'Ryan Howard',
            schedule: '06:00 PM - 07:00 PM',
            status: { tooltip: 'Pending', color: 'danger' },
            receiver: 'Kelly Kapoor',
            messages: 9,
            createdOn: '15 Jan 2021',
            startedOn: '16 Jan 2021',
            completedOn: '17 Jan 2021',
        },
        {
            id: 10,
            name: 'Andy Bernard',
            schedule: '07:00 PM - 08:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Erin Hannon',
            messages: 10,
            createdOn: '18 Jan 2021',
            startedOn: '19 Jan 2021',
            completedOn: '20 Jan 2021',
        },
        {
            id: 11,
            name: 'Angela Martin',
            schedule: '08:00 PM - 09:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Oscar Martinez',
            messages: 11,
            createdOn: '21 Jan 2021',
            startedOn: '22 Jan 2021',
            completedOn: '23 Jan 2021',
        },
        {
            id: 12,
            name: 'Kevin Malone',
            schedule: '09:00 PM - 10:00 PM',
            status: { tooltip: 'Pending', color: 'danger' },
            receiver: 'Toby Flenderson',
            messages: 12,
            createdOn: '24 Jan 2021',
            startedOn: '25 Jan 2021',
            completedOn: '26 Jan 2021',
        },
        {
            id: 13,
            name: 'Meredith Palmer',
            schedule: '10:00 PM - 11:00 PM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Creed Bratton',
            messages: 13,
            createdOn: '27 Jan 2021',
            startedOn: '28 Jan 2021',
            completedOn: '29 Jan 2021',
        },
        {
            id: 14,
            name: 'Darryl Philbin',
            schedule: '11:00 PM - 12:00 AM',
            status: { tooltip: 'Paid', color: 'success' },
            receiver: 'Roy Anderson',
            messages: 14,
            createdOn: '30 Jan 2021',
            startedOn: '31 Jan 2021',
            completedOn: '01 Feb 2021',
        },
        {
            id: 15,
            name: 'Holly Flax',
            schedule: '12:00 AM - 01:00 AM',
            status: { tooltip: 'Pending', color: 'danger' },
            receiver: 'Jan Levinson',
            messages: 15,
            createdOn: '02 Feb 2021',
            startedOn: '03 Feb 2021',
            completedOn: '04 Feb 2021',
        },
    ]);
    

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(items, 'invoice'));
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter((item) => {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.schedule.toLowerCase().includes(search.toLowerCase()) ||
                    item.status.tooltip.toLowerCase().includes(search.toLowerCase()) ||
                    item.receiver.toLowerCase().includes(search.toLowerCase()) ||
                    item.messages.toString().includes(search) ||
                    item.createdOn.toLowerCase().includes(search.toLowerCase()) ||
                    item.startedOn.toLowerCase().includes(search.toLowerCase()) ||
                    item.completedOn.toLowerCase().includes(search.toLowerCase())
                );
                
            });
        });
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

    const deleteRow = (id: any = null) => {
        if (window.confirm('Are you sure want to delete selected row ?')) {
            if (id) {
                setRecords(items.filter((user) => user.id !== id));
                setInitialRecords(items.filter((user) => user.id !== id));
                setItems(items.filter((user) => user.id !== id));
                setSelectedRecords([]);
                setSearch('');
            } else {
                let selectedRows = selectedRecords || [];
                const ids = selectedRows.map((d: any) => {
                    return d.id;
                });
                const result = items.filter((d) => !ids.includes(d.id as never));
                setRecords(result);
                setInitialRecords(result);
                setItems(result);
                setSelectedRecords([]);
                setSearch('');
                setPage(1);
            }
        }
    };

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/apps/invoice/add" className="btn btn-primary gap-2">
                            <IconPlus />
                            Create New Campaign
                        </Link>
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-success gap-2 dropdown-toggle"
                                button={
                                    <>
                                        All Campaigns
                                        <span>
                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[170px]">
                                    <li>
                                        <button type="button">All Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button">Retarget Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button">Quick Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button">Bulk Campaigns</button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={records}
                        columns={[
                            {
                                accessor: 'name',
                                sortable: true,
                                render: ({ name, id }) => (
                                    <div className="flex items-center font-semibold">
                                        <div>{name}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'schedule',
                                sortable: true,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: ({ status }) => <span className={`badge badge-outline-${status.color} `}>{status.tooltip}</span>,
                            },
                            {
                                accessor: 'receiver',
                                sortable: true,
                            },
                            {
                                accessor: 'messages',
                                sortable: true,
                            },
                            {
                                accessor: 'createdOn',
                                sortable: true,
                            },
                            {
                                accessor: 'startedOn',
                                sortable: true,
                            },
                            {
                                accessor: 'startedOn',
                                sortable: true,
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <Link href="/apps/invoice/edit" className="flex hover:text-info">
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/invoice/preview" className="flex hover:text-primary">
                                            <IconEye />
                                        </Link>
                                        <button type="button" className="flex hover:text-danger" onClick={(e) => deleteRow(id)}>
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ComponentsAppsSendMessage;
