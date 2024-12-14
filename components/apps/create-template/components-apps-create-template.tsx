'use client';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';
import { useRouter } from 'next/navigation'

const ComponentsAppsCreateTemplate = () => {
    const router = useRouter();

    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }    const [items, setItems] = useState<any>([]);

    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any>([]);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    useEffect(() => {
        const fetchAllTemplates = async () => {
            try {
                const response = await fetch(apis.getAllReferenceTemplateFormat, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.status === 401 && data.message === "Token expired! Please login again") {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    throw new Error('Token expired');
                }
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
            return items.filter((item: any) => {
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
                    await deleteTemplateAPI(_id);

                    const updatedItems = records.filter((user: any) => user._id !== _id);
                    setRecords(updatedItems);
                    setInitialRecords(updatedItems);
                    setItems(updatedItems);
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    let selectedRows = selectedRecords || [];
                    const ids = selectedRows.map((d: any) => d._id);
                    await Promise.all(ids.map((_id: any) => deleteTemplateAPI(_id)));
                    const result = records.filter((d: any) => !ids.includes(d._id as never));
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
        const response = await fetch(`${apis.deleteRefTemplate}${_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ _id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.message || 'Failed to delete the template.');
        }
    };

    const openModal = (imageUrl: any) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRecords(records);
        } else {
            setSelectedRecords([]);
        }
    };
    const isAllSelected = selectedRecords.length === records.length && records.length > 0;

    const isRecordSelected = (record: any) => {
        return selectedRecords.some((selected: any) => selected._id === record._id);
    };

    const handleCheckboxChange = (record: any) => {
        const isSelected = selectedRecords.some((selected: any) => selected._id === record._id);
        if (isSelected) {
            setSelectedRecords(selectedRecords.filter((selected: any) => selected._id !== record._id));
        } else {
            setSelectedRecords([...selectedRecords, record]);
        }
    };

    return (
        <div>
            <div>
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
                                accessor: 'templateFormat',
                                title: 'Image',
                                sortable: true,
                                render: (record) => {
                                    const { templateFormat } = record as { templateFormat: any }; // Cast record to the expected type
                                    return templateFormat?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(templateFormat?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={templateFormat.url} alt="" />
                                            </div>
                                        </div>
                                    ) : null;
                                }

                            },
                            {
                                accessor: 'name',
                                sortable: true,
                            },
                            {
                                accessor: 'height',
                                sortable: true,
                            },
                            {
                                accessor: 'width',
                                sortable: true,
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                                render: (record) => {
                                    const { createdAt } = record as { createdAt: string };
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
                                            {formattedDate} at {formattedTime}
                                        </div>
                                    );
                                },
                            },
                            // {
                            //     accessor: 'isApproved',
                            //     sortable: true,
                            //     render: (record) => {
                            //         const { isApproved } = record as { isApproved: string }; // Cast record to the expected type
                            //         return (
                            //             <button
                            //                 className={`btn ${isApproved === 'yes' ? 'btn-success' : 'btn-danger'}`}
                            //             >
                            //                 {isApproved === 'yes' ? 'Approved' : 'Not Approved'}
                            //             </button>
                            //         );
                            //     },
                            // },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record) => {
                                    const { _id } = record as { _id: string };
                                    return (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button
                                                type="button"
                                                className="flex hover:text-danger"
                                                onClick={() => deleteRow(_id)}
                                            >
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    );
                                },
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

export default ComponentsAppsCreateTemplate;
