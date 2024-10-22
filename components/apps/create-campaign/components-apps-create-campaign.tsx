'use client';

//Libraries
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

//import components
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconCopy from '@/components/icon/icon-copy';
import IconDownload from '@/components/icon/icon-download';
import Dropdown from '@/components/dropdown';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';

//File Import
import apis from '../../../public/apis';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconSend from '@/components/icon/icon-send';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconX from '@/components/icon/icon-x';

const ComponentsAppsCreateCampaign = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const token = localStorage.getItem('authToken');
    const [items, setItems] = useState<any>([]);

    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [viewHealthModal, setViewHealthModal] = useState<any>(false);
    const [overallHealth, setOverallHealth] = useState<any>(null);
    const [phonenumberHealth, setPhonenumberHealth] = useState<any>(null);
    const [wabaHealth, setWabaHealth] = useState<any>(null);
    const [businessHealth, setBusinessHealth] = useState<any>(null);
    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    //FETCH ALL CAMPAIGNS
    useEffect(() => {
        const getAllCampaigns = async () => {
            try {
                const response = await fetch(apis.getAllCampaigns, {
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

        getAllCampaigns();
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
                    const updatedItems = items.filter((user: any) => user._id !== _id);
                    setRecords(updatedItems);
                    setInitialRecords(updatedItems);
                    setItems(updatedItems);
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    let selectedRows = selectedRecords || [];
                    const ids = selectedRows.map((d: any) => d._id);

                    // API call to delete multiple rows
                    await Promise.all(ids.map((_id: any) => deleteTemplateAPI(_id)));

                    const result = items.filter((d: any) => !ids.includes(d._id as never));

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

    const viewHealth = (overallHealth: any, phonenumberHealth: any, wabaHealth: any, businessHealth: any) => {
        setOverallHealth(overallHealth);
        setPhonenumberHealth(phonenumberHealth);
        setWabaHealth(wabaHealth);
        setBusinessHealth(businessHealth);
        setViewHealthModal(true);
    };

    const sendMessage = async (_id: any) => {
        try {
            const campaignIndex = items.findIndex((item: any) => item._id === _id);
            if (campaignIndex === -1) {
                console.error('Campaign not found for ID:', _id);
                return;
            }

            const campaign = { ...items[campaignIndex] };
            const response = await fetch(apis.sendMessage, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(campaign),
            });

            const data = await response.json();
            if (!response.ok) {
                showMessage(data.message, 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            campaign.status = "completed";
            setItems((prevItems: any) => {
                const updatedItems = [...prevItems];
                updatedItems[campaignIndex] = campaign;
                return updatedItems;
            });
            showMessage(data.message);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    return (
        <div>
            <div>
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        {selectedRecords.length > 0 && (
                            <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                                <IconTrashLines />
                                Delete
                            </button>
                        )}
                        <Link href="/apps/create-campaign/create-new" className="btn btn-primary gap-2">
                            <IconPlus />
                            Create New Campaign
                        </Link>
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-success gap-2 dropdown-toggle"
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
                                        <button type="button" >All Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button" >Re-target Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button" >Quick Campaigns</button>
                                    </li>
                                    <li>
                                        <button type="button" >Bulk Campaigns</button>
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
                                render: ({ name, document, _id }) => (
                                    document?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(document?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={document?.url} alt="" />
                                            </div>
                                            <div>{name}</div>
                                        </div>
                                    ) : <div>{name}</div>
                                ),
                            },
                            {
                                accessor: 'type',
                                sortable: true,
                                render: ({ type }) => (
                                    <span>
                                        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                                    </span>
                                ),
                            },
                            {
                                accessor: 'Schedule',
                                sortable: true,
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: ({ status }) => (
                                    <span
                                        className={`badge ${status === 'completed'
                                            ? 'badge-outline-success'
                                            : 'badge-outline-danger'
                                            }`}
                                    >
                                        {status === 'completed' ? 'Completed' : 'Not Completed'}
                                    </span>
                                ),
                            },
                            {
                                accessor: 'receiver',
                                sortable: true,
                                render: ({ receiver }) => (
                                    <span className="badge badge-outline-primary">{receiver}</span>
                                ),
                            },
                            {
                                accessor: 'messages',
                                sortable: true,
                                render: ({ messages }) => (
                                    <span className="badge badge-outline-secondary">{messages}</span>
                                ),
                            },
                            {
                                accessor: 'messageType',
                                sortable: true,
                                render: ({ messageType }) => (
                                    <span>
                                        {messageType.charAt(0).toUpperCase() + messageType.slice(1).toLowerCase()}
                                    </span>
                                ),

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
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: ({ _id, schedule, overallHealth, phonenumberHealth, wabaHealth, businessHealth, status }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        {(schedule === "immediate" || status !== "completed") ? (
                                            <button className="flex hover:text-primary" onClick={() => sendMessage(_id)}>
                                                <IconSend />
                                            </button>
                                        ) : null}
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconDownload className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconCopy className="h-4.5 w-4.5" />
                                        </Link>
                                        <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                            <IconEye className="h-4.5 w-4.5" />
                                        </Link>
                                        <button className="flex hover:text-primary" onClick={() => viewHealth(overallHealth, phonenumberHealth, wabaHealth, businessHealth)}>
                                            <IconPlusCircle />
                                        </button>
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

            <Transition appear show={viewHealthModal} as={Fragment}>
                <Dialog as="div" open={viewHealthModal} onClose={() => setViewHealthModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
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
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-xl border-0 p-0 text-gray-800 dark:text-white bg-white shadow-xl dark:bg-[#1f2937]">
                                    <button
                                        type="button"
                                        onClick={() => setViewHealthModal(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-gray-100 py-4 text-lg font-medium px-6 dark:bg-[#111827]">
                                        Health Check
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className={`p-4 rounded border-2 ${overallHealth > 50 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'} bg-white dark:bg-gray-800`}>
                                                <p>Overall Health:</p>
                                                <span>{overallHealth}</span>
                                            </div>
                                            <div className={`p-4 rounded border-2 ${phonenumberHealth > 50 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'} bg-white dark:bg-gray-800`}>
                                                <p>Phone Number Health:</p>
                                                <span>{phonenumberHealth}</span>
                                            </div>
                                            <div className={`p-4 rounded border-2 ${wabaHealth > 50 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'} bg-white dark:bg-gray-800`}>
                                                <p>WABA Health:</p>
                                                <span>{wabaHealth}</span>
                                            </div>
                                            <div className={`p-4 rounded border-2 ${businessHealth > 50 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'} bg-white dark:bg-gray-800`}>
                                                <p>Business Health:</p>
                                                <span>{businessHealth}</span>
                                            </div>
                                        </div>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsCreateCampaign;
