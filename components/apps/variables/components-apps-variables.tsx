'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import React, { Fragment, useEffect, useState } from 'react';
import apis from '../../../public/apis';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import { Transition, Dialog } from '@headlessui/react';
import IconX from '@/components/icon/icon-x';
import IconPlus from '@/components/icon/icon-plus';

const ComponentsAppsVariables = () => {
    const router = useRouter();

    const [items, setItems] = useState<any>([]);
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }
    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]);

    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any>([]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [variableModel, setVariableModel] = useState<any>(false);

    const defaultParams = {
        _id: null,
        name: '',
        createdAt: '',
        updatedAt: '',
    };

    const [params, setParams] = useState(defaultParams);
    const [errors, setErrors] = useState<any>({});

    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    useEffect(() => {
        const fetchDeletedContacts = async () => {
            try {
                const response = await fetch(apis.getAllVariables, {
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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setItems(data);
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
            return records.filter((item: any) => {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase())
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
        if (window.confirm('Are you sure you want to delete the selected row(s)?')) {
            let ids = [];

            if (_id) {
                ids = [_id];
            } else {
                let selectedRows = selectedRecords || [];
                ids = selectedRows.map((d: any) => d._id);
            }

            try {
                const response = await fetch(apis.deleteVariableById, {
                    method: 'DELETE', 
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
                console.log('Deleted successfully:', data);

                const remainingItems = items.filter((user: any) => !ids.includes(user._id));

                setRecords(remainingItems);
                setInitialRecords(remainingItems); 
                setItems(remainingItems); 
                setSelectedRecords([]);
                setSearch(''); 
                setPage(1); 
                showMessage('Successfully deleted selected row(s).');
            } catch (error) {
                showMessage('Failed to delete selected row(s). Please try again.','error');
            }
        }
    };

    const saveVariable = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!params?.name) {
            showMessage('Name is required.', 'error');
            return true;
        }

        if (Object.keys(newErrors).length === 0) {
            try {
                if (params?._id) {
                    const response = await fetch(`${apis.updateVariableById}${params._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(params),
                    });

                    const data = await response.json();
                    if (response.ok) {
                        let variable = records.find((d: any) => d._id === params._id);
                        if (variable) {
                            Object.assign(variable, params);
                            setRecords((prevItems: any) => {
                                return prevItems.map((item: any) => {
                                    if (item._id === params._id) {
                                        return {
                                            ...item,
                                            ...data.data,
                                        };
                                    }
                                    return item;
                                });
                            });
                            showMessage(data.message);
                        } else {
                            showMessage(data.message, 'error');
                        }
                    } else {
                        showMessage(`Failed to update Variable: ${data.message}`, 'error');
                    }
                } else {
                    const response = await fetch(apis.createVariable, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(params),
                    });
                    const data = await response.json();

                    if (response.ok) {
                        records.splice(0, 0, data.data);
                        showMessage(data.message);
                    } else {
                        showMessage(`Failed to add Variable: ${data.message}`, 'error');
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    showMessage(`Error: ${error.message}`, 'error');
                } else {
                    showMessage('An unknown error occurred.', 'error');
                }
            }
            setVariableModel(false);
        } else {
            setErrors(newErrors);
            return true;
        }
    };

    const editVariable = (_id: any = null) => {
        const variable = records.find((u: any) => u._id === _id);
        setParams(variable);
        setVariableModel(true);
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-primary gap-2" onClick={() => editVariable()}>
                            <IconPlus />
                            Add Variable
                        </button>
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
                                title: "Variable Name",
                                sortable: true,
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                                render: (row: any) => (
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {new Date(row.createdAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                ),
                            },
                            {
                                accessor: 'updatedAt',
                                sortable: true,
                                render: (row: any) => (
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {new Date(row.updatedAt).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                ),
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record: { _id: any }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <button
                                            type="button"
                                            className="flex hover:text-danger"
                                            onClick={() => deleteRow(record._id)}
                                        >
                                            <IconTrashLines />
                                        </button>
                                        <button className="flex hover:text-info" onClick={() => editVariable(record._id)}>
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </button>
                                    </div>
                                )
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

            <Transition appear show={variableModel} as={Fragment}>
                <Dialog as="div" open={variableModel} onClose={() => setVariableModel(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 p-0 text-gray-900 dark:text-gray-100 shadow-2xl bg-white dark:bg-gray-900">
                                    <button
                                        type="button"
                                        onClick={() => setVariableModel(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <IconX />
                                    </button>

                                    <div className="bg-gray-100 py-4 px-6 text-lg font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        {params?._id ? 'Edit Variable' : 'Add Variable'}
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter Name"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params?.name || ''}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mt-8 flex justify-end space-x-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 dark:hover:bg-red-900"
                                                    onClick={() => setVariableModel(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                    onClick={saveVariable}
                                                >
                                                    {params?._id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    );
};

export default ComponentsAppsVariables;

