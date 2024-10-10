'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';
import IconCopy from '@/components/icon/icon-copy';

const ComponentsAppsCreateCampaign = () => {
    const token = localStorage.getItem('authToken');
    const [items, setItems] = useState([]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [allTemplates, setAllTemplates] = useState(null); // State for the selected file
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    useEffect(() => {
        const fetchAllTemplates = async () => {
            try {
                const response = await fetch(apis.getAllTemplates, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    showMessage(data.message, 'error');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setItems(data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchAllTemplates();
    }, []);

    useEffect(() => {
        if (items && Array.isArray(items)) {
            setInitialRecords(items);
        }
    }, [items]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;

        if (Array.isArray(initialRecords)) {
            setRecords([...initialRecords.slice(from, to)]);
        }
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter((item) => {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase())
                    // item.email.toLowerCase().includes(search.toLowerCase()) ||
                    // item.date.toLowerCase().includes(search.toLowerCase()) ||
                    // item.amount.toLowerCase().includes(search.toLowerCase()) ||
                    // item.status.tooltip.toLowerCase().includes(search.toLowerCase())
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
        if (window.confirm('Are you sure want to delete the selected Template ?')) {
            try {
                if (_id) {
                    // API call to delete a single row
                    await deleteTemplateAPI(_id);

                    // Update state after deletion
                    const updatedItems = items.filter((user) => user._id !== _id);
                    setRecords(updatedItems);
                    setInitialRecords(updatedItems);
                    setItems(updatedItems);
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    let selectedRows = selectedRecords || [];
                    const ids = selectedRows.map((d: any) => d._id);

                    // API call to delete multiple rows
                    await Promise.all(ids.map((_id) => deleteTemplateAPI(_id)));

                    const result = items.filter((d) => !ids.includes(d._id as never));

                    // Update state after deletion
                    setRecords(result);
                    setInitialRecords(result);
                    setItems(result);
                    setSelectedRecords([]);
                    setSearch('');
                    setPage(1);
                }
                showMessage('Template deleted successfully');
            } catch (error) {
                console.error('Error deleting template:', error);
                showMessage('An error occurred while deleting the template.', 'error');
            }
        }
    };

    const deleteTemplateAPI = async (_id: any) => {
        const response = await fetch(apis.deleteTemplate, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Include auth token if required
            },
            body: JSON.stringify({ _id }), // Send the ID to delete
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.message || 'Failed to delete the template.');
        }
    };

    const openModal = (imageUrl) => {
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
                        <Link href="/apps/create-template/create-new" className="btn btn-primary gap-2">
                            <IconPlus />
                            Create Template
                        </Link>
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
                                accessor: 'template',
                                sortable: true,
                                render: ({ template }) => (
                                    template?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(template?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={template.url} alt="" />
                                            </div>
                                        </div>
                                    ) : null
                                ),
                            },
                            {
                                accessor: 'name',
                                sortable: true,
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                                render: ({ createdAt }) => {
                                    const date = new Date(createdAt);
                                    const formattedDate = date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });
                                    const formattedTime = date.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });

                                    return (
                                        <div>
                                            <div className="text">{formattedDate}</div>
                                            <div className="text-sm text-gray-500">{formattedTime}</div> {/* Time in smaller, blurred text */}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'isApproved',
                                sortable: true,
                                render: ({ isApproved }) => (
                                    <button
                                        className={`btn ${isApproved === 'yes'
                                            ? 'btn-success'
                                            : 'btn-danger'
                                            }`}
                                    >
                                        {isApproved === 'yes' ? 'Approved' : 'Not Approved'}
                                    </button>
                                ),
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ _id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconCopy className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/invoice/preview" className="flex hover:text-primary">
                                            <IconEye />
                                        </Link>
                                        <button type="button" className="flex hover:text-danger" onClick={(e) => deleteRow(_id)}>
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords?.length}
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

export default ComponentsAppsCreateCampaign;
