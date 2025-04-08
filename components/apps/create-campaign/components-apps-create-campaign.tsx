'use client';

//Libraries
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'

//import components
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconCopy from '@/components/icon/icon-copy';
import Dropdown from '@/components/dropdown';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';

//File Import
import apis, { duplicateCampaign } from '../../../public/apis';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconSend from '@/components/icon/icon-send';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconX from '@/components/icon/icon-x';

const ComponentsAppsCreateCampaign = () => {
    const router = useRouter();

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [items, setItems] = useState<any>([]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [filteredRecords, setFilteredRecords] = useState([]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [totalRecords, setTotalRecords] = useState(10);
    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'createdAt',
        direction: 'desc',
    });

    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [viewHealthModal, setViewHealthModal] = useState<any>(false);
    const [duplicateModel, setDuplicateModel] = useState<any>(false);
    const [overallHealth, setOverallHealth] = useState<any>(null);
    const [phonenumberHealth, setPhonenumberHealth] = useState<any>(null);
    const [wabaHealth, setWabaHealth] = useState<any>(null);
    const [businessHealth, setBusinessHealth] = useState<any>(null);
    const [duplicateCampaignName, setDuplicateCampaignName] = useState("");
    const [duplicateCampaignId, setDuplicateCampaignId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingRows, setLoadingRows] = useState<{ [key: string]: boolean }>({});
    const [activeFilter, setActiveFilter] = useState<string>('All Campaigns');

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
                    body: JSON.stringify({
                        limit: pageSize,
                        pageCount: page,
                        search: search,
                        sortingField: sortStatus.columnAccessor,
                        sortingOrder: sortStatus.direction,
                        filter: {
                            type: activeFilter === "Immediate Campaigns" ? "immediate" :
                                activeFilter === "Schedule Campaigns" ? "schedule" : undefined,
                            freezedAudienceIds: activeFilter === "Freezed Campaign" ? true : undefined,
                            nameEndsWith: activeFilter === "Re-target Campaigns" ? "retarget" : undefined,
                        },
                    }),
                });

                const data = await response.json();

                if (response.status === 401 && data.message === "Token expired! Please login again") {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    throw new Error('Token expired');
                }

                if (!response.ok) {
                    showMessage(data.message, 'error');
                    return;
                }

                setItems(data.data);
                setTotalRecords(data.totalRecords);
                const hasProcessingCampaign = data.data.some((campaign: any) => campaign.status === "processing");
                if (hasProcessingCampaign) {
                    if (!intervalRef.current) {
                        intervalRef.current = setInterval(getAllCampaigns, 5000);
                    }
                } else {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            }
        };

        getAllCampaigns();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [page, pageSize, search, sortStatus, activeFilter]);

    useEffect(() => {
        setPage(1);
    }, [pageSize, search]);

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
                    const updatedItems = items.filter((user: any) => user._id !== _id);
                    setItems(updatedItems);
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    let selectedRows = selectedRecords || [];
                    const ids = selectedRows.map((d: any) => d._id);
                    await Promise.all(ids.map((_id: any) => deleteTemplateAPI(_id)));
                    const result = items.filter((d: any) => !ids.includes(d._id as never));

                    setItems(result);
                    setSelectedRecords([]);
                    setSearch('');
                }
                showMessage('Campaign deleted successfully');
            } catch (error) {
                console.error('Error deleting template:', error);
                showMessage('An error occurred while deleting the template.', 'error');
            }
        }
    };

    const deleteTemplateAPI = async (_id: any) => {
        const response = await fetch(apis.deleteCampaign, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: _id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.message || 'Failed to delete the template.');
            return;
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

    const sendMessage = async (_id: any) => {
        setLoadingRows((prev) => ({ ...prev, [_id]: true }));
        try {
            const campaignIndex = items.findIndex((item: any) => item._id === _id);
            if (campaignIndex === -1) {
                console.error('Campaign not found for ID:', _id);
                showMessage('Campaign not found. Please refresh and try again.', 'error');
                setLoadingRows((prev) => ({ ...prev, [_id]: false }));
                return;
            }

            const campaign = { ...items[campaignIndex], status: "processing" };

            setItems((prevItems: any) => {
                const updatedItems = [...prevItems];
                updatedItems[campaignIndex] = campaign;
                return updatedItems;
            });

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
                return;
            }

            campaign.status = "completed";
            setItems((prevItems: any) => {
                const updatedItems = [...prevItems];
                updatedItems[campaignIndex] = campaign;
                return updatedItems;
            });
            showMessage(data.message);
        } catch (error) {
            showMessage('Error Sending Messages, Please Try again', 'error');
        } finally {
            setLoadingRows((prev) => ({ ...prev, [_id]: false }));
        }
    };

    const openDuplicateModal = (id: any) => {
        setDuplicateCampaignId(id);
        setDuplicateModel(true);
    };

    const handleSaveDuplicateCampaign = async () => {
        setLoading(true);

        if (!duplicateCampaignName) {
            alert("Please enter a name for the duplicate campaign.");
            setLoading(false);
            return;
        }
        const response = await fetch(`${apis.duplicateCampaign}${duplicateCampaignId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name: duplicateCampaignName })
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 404) {
                showMessage("Original campaign not found.", 'error');
            } else if (response.status === 403) {
                showMessage(`Campaign with the name "${duplicateCampaignName}" already exists! Please use a different name.`, 'error');
                setDuplicateModel(false);
                setDuplicateCampaignName(duplicateCampaignName);
            } else {
                showMessage(data.message || "An error occurred while duplicating the campaign.", 'error');
            }
            return;
        }
        setItems([...items, data.data]);
        showMessage(data.message);
        setDuplicateModel(false);
        setDuplicateCampaignName('');
        setLoading(false);
    };

    const isImageUrl = (url: any) => {
        const imageExtensions = ["jpeg", "png"];
        const extension = url?.split(".").pop()?.toLowerCase();
        return imageExtensions.includes(extension);
    };

    const handleCheckboxChange = (record: any) => {
        const isSelected = selectedRecords.some((selected: any) => selected._id === record._id);
        if (isSelected) {
            setSelectedRecords(selectedRecords.filter((selected: any) => selected._id !== record._id));
        } else {
            setSelectedRecords([...selectedRecords, record]);
        }
    };

    const isRecordSelected = (record: any) => {
        return selectedRecords.some((selected: any) => selected._id === record._id);
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRecords(items);
        } else {
            setSelectedRecords([]);
        }
    };
    const isAllSelected = selectedRecords.length === items.length && items.length > 0;

    const isVideoUrl = (url: any) => /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(url);

    const isDocumentUrl = (url: any) => /\.(pdf|doc|docx|ppt|pptx|txt)$/i.test(url);

    return (
        <div>
            <div>
                <div className="mb-4.5 flex flex-col gap-5 px-2 md:flex-row md:items-center">
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
                                        {activeFilter}
                                        <span>
                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[200px]">
                                    {['All Campaigns', 'Re-target Campaigns', 'Immediate Campaigns', 'Schedule Campaigns', 'Freezed Campaign'].map(filter => (
                                        <li key={filter}>
                                            <button
                                                type="button"
                                                className={filter === activeFilter ? 'active-filter' : ''}
                                                onClick={() => setActiveFilter(filter)}
                                            >
                                                {filter}
                                            </button>
                                        </li>
                                    ))}
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
                        records={items}
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
                                accessor: 'name',
                                sortable: true,
                                render: (record: { type: string; }, index: number) => {
                                    const { name, document } = record as { type: string; name: string; document?: { url: string } }; // Type assertion

                                    const getThumbnail = (url: string) => {
                                        if (isImageUrl(url)) {
                                            return (
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    src={url}
                                                    alt="Document Thumbnail"
                                                    loading="lazy"
                                                />
                                            );
                                        } else if (isVideoUrl(url)) {
                                            return (
                                                <div className="h-8 w-8 flex items-center justify-center bg-blue-200 rounded-full text-blue-600">
                                                    {/* Video Icon */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17 10.5V7c0-.5-.3-.9-.7-1.1-.4-.2-.9-.1-1.3.2L11.5 9.5c-.2.1-.4.2-.5.5s-.1.4.1.5l3.5 3.4c.4.4.9.4 1.3.2.4-.2.7-.6.7-1.1v-3.5l2.8 1.8c.3.2.6.4.8.7s.2.6.2.9v5.5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-11c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v5.5l-3-1.9z" />
                                                    </svg>
                                                </div>
                                            );
                                        } else if (isDocumentUrl(url)) {
                                            return (
                                                <div className="h-8 w-8 flex items-center justify-center bg-yellow-200 rounded-full text-yellow-600">
                                                    {/* Document Icon */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-5-7zm4 18H7V4h5v6h5v10z" />
                                                    </svg>
                                                </div>
                                            );
                                        }
                                        return null;
                                    };

                                    return (
                                        <div className="flex items-center font-semibold">
                                            {document?.url && (
                                                <div
                                                    className={`w-max rounded-full bg-white-dark/10 p-0.5 ltr:mr-2 rtl:ml-2 ${isImageUrl(document?.url) ? "cursor-pointer" : ""}`}
                                                    onClick={() => {
                                                        if (isImageUrl(document?.url)) openModal(document?.url);
                                                    }}
                                                >
                                                    {getThumbnail(document?.url)}
                                                </div>
                                            )}
                                            <div>{name}</div>
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'type',
                                sortable: true,
                                render: (record: { type: string }) => (
                                    <span>
                                        {record.type.charAt(0).toUpperCase() + record.type.slice(1).toLowerCase()}
                                    </span>
                                ),
                            },
                            {
                                accessor: "schedule",
                                sortable: true,
                                render: (record: { type: string; schedule?: string }) => {
                                    if (!record.schedule) return "-";

                                    const date = new Date(record.schedule);
                                    const formattedDate = date.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    });
                                    const formattedTime = date.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <div>
                                            <div className="text">{formattedDate}</div>
                                            <div className="text-sm text-gray-500">{formattedTime}</div>
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                render: (record: { type: string; }, index: number) => {
                                    const { status, process, countAudience } = record as { type: string; status: string; process: number; countAudience: number }; // Type assertion

                                    return (
                                        <span
                                            className={`badge inline-flex items-center ${status === 'completed'
                                                ? 'badge-outline-success'
                                                : status === 'processing'
                                                    ? 'badge-outline-warning'
                                                    : 'badge-outline-danger'
                                                }`}
                                        >
                                            {status === 'processing' && (
                                                <div className="w-4 h-4 mr-1 border-4 border-dashed rounded-full animate-spin border-orange-300"></div>
                                            )}
                                            {status === 'completed'
                                                ? 'Completed'
                                                : status === 'processing'
                                                    ? ` Processing ${countAudience > 0 && process > 0
                                                        ? Math.round((process / countAudience) * 100) + '%'
                                                        : '0%'
                                                    }`
                                                    : 'Not Completed'}
                                        </span>
                                    );
                                },
                            },
                            {
                                accessor: 'receiver',
                                render: (record: { type: string; receiver?: string | number }) => {
                                    const { receiver } = record as { type: string; receiver?: string | number };

                                    return (
                                        <span className="badge badge-outline-primary">{receiver ? receiver : 0}</span>
                                    );
                                },
                            },
                            {
                                title: 'Messages',
                                accessor: 'countAudience',
                                render: (record: { type: string; countAudience?: number }) => {
                                    const { countAudience } = record as { type: string; countAudience?: number };

                                    return (
                                        <span className="badge badge-outline-secondary">{countAudience}</span>
                                    );
                                },
                            },
                            {
                                accessor: 'messageType',
                                render: (record: { type: string; messageType?: string }) => {
                                    const { messageType } = record as { type: string; messageType?: string };

                                    return (
                                        <span>
                                            {messageType ? messageType.charAt(0).toUpperCase() + messageType.slice(1).toLowerCase() : 'N/A'}
                                        </span>
                                    );
                                },
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                                render: (record: { type: string; schedule?: string; createdAt?: string }, index: number) => {
                                    const createdAt = record.createdAt || '';
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
                                render: (record: { type: string; }, index: number) => {
                                    const { _id, schedule, status, type } = record as unknown as { _id: string; schedule: string; status: string, type: string };
                                    return (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            {status !== "processing" && (
                                                <>
                                                    {(type === "immediate" && status !== "completed") && (
                                                        <button
                                                            className={`flex hover:text-primary ${loadingRows[_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => sendMessage(_id)}
                                                            disabled={loadingRows[_id]}
                                                        >
                                                            {loadingRows[_id] ? 'Sending...' : <IconSend />}
                                                        </button>
                                                    )}

                                                    {status === "completed" ? (
                                                        <>
                                                            <button className="flex hover:text-primary" onClick={() => openDuplicateModal(_id)}>
                                                                <IconCopy className="h-4.5 w-4.5" />
                                                            </button>
                                                            <Link href={`/apps/create-campaign/overview?_id=${_id}`} className="flex hover:text-info">
                                                                <IconEye className="h-4.5 w-4.5" />
                                                            </Link>
                                                            <button type="button" className="flex hover:text-danger" onClick={() => deleteRow(_id)}>
                                                                <IconTrashLines />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="flex hover:text-primary" onClick={() => openDuplicateModal(_id)}>
                                                                <IconCopy className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button type="button" className="flex hover:text-danger" onClick={() => deleteRow(_id)}>
                                                                <IconTrashLines />
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                },
                            }
                        ]}
                        highlightOnHover
                        totalRecords={totalRecords}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={(size) => {
                            setPageSize(size);
                            setPage(1);
                        }}
                        sortStatus={sortStatus}
                        onSortStatusChange={(status) => {
                            setSortStatus(status);
                        }}
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

            <Transition appear show={duplicateModel} as={Fragment}>
                <Dialog as="div" open={duplicateModel} onClose={() => setDuplicateModel(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-70" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="bg-white rounded-lg p-6 shadow-lg">
                                <button onClick={() => setDuplicateModel(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium mb-4">Create Duplicate Campaign</div>
                                <div>
                                    <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
                                        Campaign Name
                                    </label>
                                    <input
                                        id="campaignName"
                                        type="text"
                                        className="mt-1 block w-full border rounded p-2"
                                        placeholder="Enter campaign name"
                                        value={duplicateCampaignName}
                                        onChange={(e) => setDuplicateCampaignName(e.target.value)}
                                    />
                                </div>
                                <div className="mt-4 text-right">
                                    <button
                                        onClick={() => handleSaveDuplicateCampaign()}
                                        className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 000 8H4z"
                                                    ></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : "Save"}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsCreateCampaign;
