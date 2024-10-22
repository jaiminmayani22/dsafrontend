'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import apis from '../../../public/apis';
import IconRestore from '@/components/icon/icon-restore';
import Swal from 'sweetalert2';

const ComponentsAppsTrash = () => {
    const [items, setItems] = useState<any>([]);
    const token = localStorage.getItem('authToken');

    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]);

    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    useEffect(() => {
        const fetchDeletedContacts = async () => {
            try {
                const response = await fetch(apis.getAllDeletedClient, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setItems(data.data);
                const records = items.map((item: any) => ({
                    ...item,
                    _id: item._id
                }));
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchDeletedContacts();
    }, []);

    useEffect(() => {
        const sortedItems = sortBy(items, 'updatedAt');
        setInitialRecords(sortedItems);
        setRecords(sortedItems);
    }, [items]);

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
            return items.filter((item: any) => {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.whatsapp_number.toLowerCase().includes(search.toLowerCase()) ||
                    item.mobile_number.toLowerCase().includes(search.toLowerCase()) ||
                    item.company_name.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const deleteRow = async (_id: any = null) => {
        if (window.confirm('Are you sure want to delete selected row ?')) {
            let ids = [];

            if (_id) {
                ids = [_id];
            } else {
                let selectedRows = selectedRecords || [];
                ids = selectedRows.map((d: any) => d._id);
            }

            try {
                const response = await fetch(apis.hardDeleteClients, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ids }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const remainingItems = items.filter((user: any) => !ids.includes(user._id));

                setRecords(remainingItems);
                setInitialRecords(remainingItems);
                setItems(remainingItems);
                setSelectedRecords([]);
                setSearch('');
                setPage(1);
                showMessage('Successfully deleted selected Contacts');
            } catch (error) {
                console.error('Error deleting contacts:', error);
            }
        }
    };

    const restoreRow = async (_id: any = null) => {
        if (window.confirm('Are you sure want to restore the selected row(s)?')) {
            let ids = [];
            if (_id) {
                ids = [_id];
            } else {
                let selectedRows = selectedRecords || [];
                ids = selectedRows.map((d: any) => d._id);
            }

            try {
                const response = await fetch(apis.restoreClients, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ids }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const updatedItems = items.map((user: any) => {
                    if (ids.includes(user._id)) {
                        return { ...user, isDeleted: false };
                    }
                    return user;
                });
                setRecords(updatedItems);
                setInitialRecords(updatedItems);
                setItems(updatedItems);
                setSelectedRecords([]);
                setSearch('');
                setPage(1);
                showMessage('Successfully restored selected Contacts');
            } catch (error) {
                console.error('Error restoring contacts:', error);
            }
        }
    };

    const handleCheckboxChange = (record: any) => {
        const isSelected = selectedRecords.some(selected => selected._id === record._id);
        if (isSelected) {
            setSelectedRecords(selectedRecords.filter(selected => selected._id !== record._id));
        } else {
            setSelectedRecords([...selectedRecords, record]);
        }
    };

    const isRecordSelected = (record: any) => {
        return selectedRecords.some(selected => selected._id === record._id);
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRecords(records);
        } else {
            setSelectedRecords([]);
        }
    };
    const isAllSelected = selectedRecords.length === records.length && records.length > 0;

    const openModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                            <IconTrashLines />
                            Delete
                        </button>
                        <button type="button" className="btn btn-success gap-2" onClick={() => restoreRow()}>
                            <IconRestore />
                            Restore
                        </button>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {selectedRecords.length > 0 && (
                        <div className="w-full text-sm text-gray-600">
                            {selectedRecords.length} contact{selectedRecords.length > 1 ? 's' : ''} selected
                        </div>
                    )}
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={records}
                        columns={[
                            {
                                accessor: 'checkbox',
                                title: (
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAllChange}
                                    />
                                ),
                                render: (record) => (
                                    <input
                                        type="checkbox"
                                        checked={isRecordSelected(record)}
                                        onChange={() => handleCheckboxChange(record)}
                                    />
                                ),
                            },
                            {
                                accessor: 'company_profile_picture',
                                sortable: true,
                                render: (record: any) => {
                                    const { company_profile_picture } = record;
                                    return (company_profile_picture?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(company_profile_picture?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={company_profile_picture.url} alt="" />
                                            </div>
                                        </div>
                                    ) : null)
                                },
                            },
                            {
                                accessor: 'name',
                                sortable: true,
                                render: ({ name, profile_picture, _id }) => (
                                    profile_picture?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(profile_picture?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={profile_picture?.url} alt="" />
                                            </div>
                                            <div>{name}</div>
                                        </div>
                                    ) : <div>{name}</div>

                                ),
                            },
                            {
                                accessor: 'email',
                                sortable: true,
                            },
                            {
                                accessor: 'groupName',
                                sortable: true,
                                render: ({ groupName }) => {
                                    if (!groupName) {
                                        return null;
                                    }

                                    const options = groupName.split(',').map((option: any) => option.trim());

                                    return (
                                        <select>
                                            {options.map((option: any, index: any) => (
                                                <option key={index} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                },
                            },
                            {
                                accessor: 'mobile_number',
                                sortable: true,
                            },
                            {
                                accessor: 'whatsapp_number',
                                sortable: true,
                            },
                            {
                                accessor: 'company_name',
                                sortable: true,
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                            },
                            {
                                accessor: 'updatedAt',
                                sortable: true,
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ _id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <button type="button" className="flex hover:text-danger" onClick={(e) => deleteRow(_id)}>
                                            <IconTrashLines />
                                        </button>
                                        <button type="button" className="flex hover:text-danger" onClick={(e) => restoreRow(_id)}>
                                            <IconRestore />
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
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative">
                        {/* Image */}
                        <img className="max-w-full max-h-screen" src={selectedImage} alt="Large Preview" />

                        {/* Close button */}
                        <button
                            className="absolute top-2 right-2 text-white bg-black p-2 rounded-full"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentsAppsTrash;
