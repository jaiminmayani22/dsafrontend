'use client';

//Libraries
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Flatpickr from 'react-flatpickr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter } from 'next/navigation'

//import components
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';

//File Import
import apis from '../../../public/apis';
import IconSend from '@/components/icon/icon-send';
import IconX from '@/components/icon/icon-x';
import IconBell from '@/components/icon/icon-bell';
import IconNotesEdit from '@/components/icon/icon-notes-edit';
import IconCalendar from '@/components/icon/icon-calendar';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconListCheck from '@/components/icon/icon-list-check';
import IconChecks from '@/components/icon/icon-checks';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconMinus from '@/components/icon/icon-minus';
import IconMultipleForwardRight from '@/components/icon/icon-multiple-forward-right';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import 'flatpickr/dist/flatpickr.css';
import WhatsAppMessagePreview from './components-whatsappPreview';
import autoTable from 'jspdf-autotable';

const ComponentsAppsCampaignOverview = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const _id = searchParams.get('_id');

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }

    const [items, setItems] = useState<any>([]);
    const [details, setDetails] = useState<any>([]);

    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });
    const [retargetModal, setRetargetModal] = useState<any>(false);
    const [params, setParams] = useState<any>();
    const [date, setDate] = useState<any>(new Date().toISOString().slice(0, 16));
    const [name, setName] = useState(items.name);
    const [type, setType] = useState(items.type || 'immediate');
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(items.caption);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    //FETCH ALL CAMPAIGNS
    useEffect(() => {
        const getCampaignData = async () => {
            await fetch(apis.getCampaignById, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ _id: _id }),
            })
                .then(async (response) => {
                    return response.json().then(async (data) => {
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

                        await fetch(apis.getMessagesForCampaign, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ _id: _id }),
                        })
                            .then(async (response) => {
                                return response.json().then(data => {
                                    if (response.status === 401 && data.message === "Token expired! Please login again") {
                                        showMessage(data.message, 'error');
                                        router.push('/auth/boxed-signin');
                                        throw new Error('Token expired');
                                    }
                                    if (!response.ok) {
                                        showMessage(data.message, 'error');
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    setDetails(data.data);
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching contacts:', error);
                            });
                    });
                })
                .catch(error => {
                    console.error('Error fetching contacts:', error);
                });
        };

        getCampaignData();
    }, []);
    // useEffect(() => {
    //     setPage(1);
    // }, [pageSize]);

    // useEffect(() => {
    //     const from = (page - 1) * pageSize;
    //     const to = from + pageSize;

    //     if (Array.isArray(initialRecords)) {
    //         setItems([...initialRecords.slice(from, to)]);
    //     }
    // }, [page, pageSize, initialRecords]);

    // useEffect(() => {
    //     const data2 = sortBy(items.audienceIds, sortStatus.columnAccessor);
    //     setItems(sortStatus.direction === 'desc' ? data2.reverse() : data2);
    //     setPage(1);
    // }, [sortStatus]);

    useEffect(() => {
        setName(items.name);
    }, [items.name]);

    useEffect(() => {
        setType(items.type || 'immediate');
    }, [items.type]);

    const retargetButtonClick = async () => {
        interface Data {
            name: any;
            type: any;
            audienceIds: any[];
            audience: any;
            messageType: any;
            document: any;
            caption: any;
            button: any;
            schedule?: any;          // Optional properties
            groups?: any;
            documentType?: any;
            selectedRefTemplate?: any;
            trigger?: boolean;
        }

        const data: Data = {
            name,
            type,
            audienceIds: selectedRecords,
            audience: items.audience,
            messageType: items.messageType,
            document: items.document,
            caption: items.caption,
            button: items.button,
        };

        if (params.type === 'schedule') {
            data.schedule = date;
        }
        if (items.audience === "group") {
            data.groups = items.groups;
        }
        if (items.messageType === 'marketing') {
            data.documentType = items.documentType;
        } else {
            data.selectedRefTemplate = items.selectedRefTemplate;
        }
        if (params.trigger === true) {
            data.trigger = params.trigger;
        }

        try {
            const response = await fetch(apis.createRetargetCampaign, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            const newTemplate = await response.json();
            if (response.ok) {
                showMessage(newTemplate.message);
                setRetargetModal(false);
                router.push('/apps/create-campaign')
            } else {
                showMessage(newTemplate.message, 'error');
            }
        } catch (error) {
            showMessage('Error uploading template', 'error');
        }
    };

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

    const changeValue = (e: any) => {
        const { value, id, checked, type } = e.target;
        setParams((prevParams: any) => ({
            ...prevParams,
            [id]: type === "checkbox" ? checked : value,
        }));
        if (id === "name") {
            setName(value);
        } else if (id === "type") {
            setType(value);
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
            setSelectedRecords(items.audienceIds);
        } else {
            setSelectedRecords([]);
        }
    };
    const isAllSelected = selectedRecords.length === items.audienceIds?.length && items.audienceIds?.length > 0;

    const handleExportPdf = async () => {
        const pdf = new jsPDF() as jsPDF & { autoTable: Function };

        pdf.setFontSize(18);
        pdf.text("Campaign Details", 10, 10);
        pdf.setFontSize(12);
        const mainDetails = [
            { label: "Name", value: items.name },
            { label: "Type", value: items.type },
            { label: "Status", value: items.status },
            { label: "Audience", value: items.audience },
            { label: "Audience Count", value: items.countAudience },
            { label: "Caption", value: items.caption },
            { label: "Message Type", value: items.messageType },
            { label: "Created At", value: items.createdAt },
        ];

        let yPosition = 20;
        const labelX = 10;
        const valueX = 60;
        const valueX1 = 50;
        const pageWidth = pdf.internal.pageSize.getWidth();

        mainDetails.forEach((detail) => {
            pdf.text(`${detail.label}`, labelX, yPosition);
            pdf.text(`:`, valueX1, yPosition);
            pdf.text(detail.value.toString(), valueX, yPosition);
            yPosition += 8;
        });

        const audienceColumns = ["Name", "Whatsapp Number"];
        const audienceRows = items.audienceIds.map((item: any) => [
            item.name,
            item.whatsapp_number,
        ]);

        pdf.autoTable({
            startY: yPosition + 10,
            head: [audienceColumns],
            body: audienceRows,
        });

        const imageYPosition = (pdf as any).autoTable.previous.finalY + 20;
        const titleYPosition = imageYPosition - 10;

        if (items.document?.url) {
            await new Promise<void>((resolve, reject) => {
                const imageUrl = items.document.url;
                const image = new Image();
                image.crossOrigin = "Anonymous";
                image.src = imageUrl;

                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = image.width !== 0 ? image.width : 400;
                    canvas.height = image.height !== 0 ? image.height : 400;
                    const context = canvas.getContext("2d");
                    context?.drawImage(image, 0, 0);
                    const imageData = canvas.toDataURL("image/png");
                    const titleX = (pageWidth - pdf.getTextWidth("Campaign Image")) / 2;
                    const imageX = (pageWidth - 50) / 2;
                    pdf.text("Campaign Image", titleX, titleYPosition);
                    pdf.addImage(imageData, "PNG", imageX, imageYPosition, 50, 50);
                    resolve();
                };

                image.onerror = (error) => {
                    console.error("Image loading error:", error);
                    reject(error);
                };
            });
        }
        pdf.save(`${items.name}_details.pdf`);
    };

    const handleExportNumberPdf = () => {
        const pdf = new jsPDF();
        pdf.text(`Contact List of Campaign: "${name}"`, 14, 10);

        const formattedData = filteredDetails.map((item: any) => [item.clientName, item.mobileNumber]);
        if (formattedData.length <= 0) {
            showMessage(`No contacts found for "${selectedStatus}" message`, 'error');
            return;
        }
        autoTable(pdf, {
            head: [['Name', 'WhatsApp Number']],
            body: formattedData,
            startY: 20,
            styles: {
                cellPadding: 3,
                fontSize: 10,
                valign: 'middle',
                halign: 'center',
            },
        });

        pdf.save(`${name}_Contact-list.pdf`);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e: any) => {
        setCaption(e.target.value);
    };

    const filteredDetails = selectedStatus
        ? details.filter((item: any) => item.status === selectedStatus)
        : details;

    return (
        <div>
            <div className="flex flex-col gap-5 px-2 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                    <b>Campaign Overview</b>
                </div>
                <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-2">
                    <button type="button" className="btn btn-outline-primary gap-2" onClick={() => setIsModalOpen(true)}>
                        View Image
                    </button>
                    <button type="button" className="btn btn-primary gap-2" onClick={() => handleExportPdf()}>
                        <IconSend />
                        Export
                    </button>
                </div>
            </div>
            <br />
            <div>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Campaign Status", content: `${items.status}`, icon: <IconBell /> },
                        { label: "Campaign Name", content: `${items.name}`, icon: <IconNotesEdit /> },
                        { label: "Triggered Campaign", content: `${items.type}`, icon: <IconCalendar /> },
                        {
                            label: "Proceed At",
                            content: `${items.schedule !== "" ? items.schedule : new Date(items.createdAt).toLocaleString('en-GB', {
                                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}`,
                            icon: <IconMenuDatatables />
                        }].map((item, index) => (
                            <div className="panel p-2 flex items-center" key={index}>
                                <div className="grid h-10 w-10 shrink-0 place-content-center ">
                                    {item.icon}
                                </div>
                                <div className="ltr:ml-2 rtl:mr-2">
                                    <h6 className="text-dark dark:text-white-light text-sm font-semibold">
                                        {item.label}
                                    </h6>
                                    <p className="text-xs font-medium text-gray-500">{item.content}</p>
                                </div>
                            </div>
                        ))}
                </div>
                <br />
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li className="ltr:before:mr-2 rtl:before:ml-2">
                        <b>Campaign Report</b>
                    </li>
                </ul>
                <br />
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Overall",
                            value: `${((details.length / items.countAudience) * 100).toFixed(2)}%`,
                            count: items.countAudience,
                            icon: <IconListCheck />,
                            status: null,
                        },
                        {
                            label: "Sent",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "sent").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "sent").length,
                            icon: <IconMultipleForwardRight />,
                            status: "sent",
                        },
                        {
                            label: "Delivered",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "delivered").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "delivered").length,
                            icon: <IconChecks />,
                            status: "delivered",
                        },
                        {
                            label: "Read",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "read").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "read").length,
                            icon: <IconChecks />,
                            status: "read",
                        },
                        {
                            label: "Replied",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "accepted").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "accepted").length,
                            icon: <IconArrowBackward />,
                            status: "accepted",
                        },
                        {
                            label: "Failed",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "failed").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "failed").length,
                            icon: <IconX />,
                            status: "failed",
                        },
                        {
                            label: "Blocked Numbers",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "rejected").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "rejected").length,
                            icon: <IconMinus />,
                            status: "rejected",
                        },
                    ].map((item, index) => (
                        <div className="panel p-2 flex items-center font-semibold" key={index} onClick={() => setSelectedStatus(item.status)}>
                            <div className="grid h-10 w-10 shrink-0 place-content-center">
                                {item.icon}
                            </div>
                            <div className="ltr:ml-2 rtl:mr-2">
                                <h6 className="text-dark dark:text-white-light text-sm font-semibold">
                                    {item.value} ({item.count})
                                </h6>
                                <p className="text-xs text-gray-500">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <br />
                <div className="flex items-center gap-5 px-2 md:flex-row w-full">
                    <div className="flex items-center gap-2">
                        <b>Campaign Overview</b>
                    </div>
                    <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-2">
                        <span className="btn btn-outline-success">
                            Total : {details?.length}
                        </span>
                        {(selectedStatus === 'failed' && (
                            <button type="button" className="btn btn-primary flex items-center gap-x-2" onClick={() => setRetargetModal(true)}>
                                <IconPlusCircle />
                                Re-target
                            </button>
                        ))}
                        <button type="button" className="btn btn-warning flex items-center gap-x-2" onClick={() => handleExportNumberPdf()}>
                            Export
                            <IconSend />
                        </button>
                    </div>
                </div>
                <br />
                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={filteredDetails}
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
                                accessor: 'clientName',
                                sortable: true
                            },
                            {
                                accessor: 'mobileNumber',
                                sortable: true
                            },
                            {
                                accessor: 'status',
                                render: (record) => {
                                    const { status } = record as { status: string };
                                    const statusStyles: { [key: string]: string } = {
                                        sent: 'btn btn-primary', // Blue
                                        delivered: 'btn btn-success', // Green
                                        read: 'btn btn-info', // Light blue
                                        failed: 'btn btn-danger', // Red
                                        undelivered: 'btn btn-warning', // Yellow
                                        acknowledged: 'btn btn-dark', // Dark gray
                                        deleted: 'btn btn-secondary', // Gray
                                        expired: 'btn btn-outline-warning', // Outline Yellow
                                        rejected: 'btn btn-outline-danger', // Outline Red
                                        pending: 'btn btn-warning', // Yellow
                                        cancelled: 'btn btn-outline-secondary', // Outline Gray
                                        default: 'btn btn-light' // Light Gray for unknown statuses
                                    };

                                    const buttonClass = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
                                    return (
                                        <button className={buttonClass} disabled>
                                            {status
                                                .charAt(0)
                                                .toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                                        </button>
                                    );
                                },
                            },
                            {
                                accessor: 'reason',
                            },
                        ]}
                        highlightOnHover
                        totalRecords={items?.audienceIds?.length}
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

            <Transition appear show={retargetModal} as={Fragment}>
                <Dialog as="div" open={retargetModal} onClose={() => setRetargetModal(false)} className="relative z-50">
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
                                        onClick={() => setRetargetModal(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <IconX />
                                    </button>

                                    <div className="bg-gray-100 py-4 px-6 text-lg font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        Re-target
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Retarget Campaign Title <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter Campaign Name"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring focus:ring-blue-500"
                                                    value={name}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mb-5">
                                                <label htmlFor="schedule_type" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Schedule Type
                                                </label>
                                                <select
                                                    id="type"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring focus:ring-blue-500"
                                                    value={type}
                                                    onChange={changeValue}
                                                >
                                                    <option value="" disabled>Select a schedule type</option>
                                                    <option value="immediate">Immediate</option>
                                                    <option value="schedule">Schedule</option>
                                                </select>
                                            </div>

                                            {params?.type === 'schedule' && (
                                                <div className="mb-5">
                                                    <label htmlFor="schedule" className="block font-medium text-gray-700 dark:text-gray-300">
                                                        Schedule Time & Date
                                                    </label>
                                                    <Flatpickr
                                                        data-enable-time
                                                        value={date}
                                                        options={{
                                                            enableTime: true,
                                                            dateFormat: 'Y-m-d H:i',
                                                            position: 'auto',
                                                            minDate: new Date(),
                                                        }}
                                                        className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring focus:ring-blue-500"
                                                        onChange={(selectedDates) => {
                                                            setDate(selectedDates[0]);
                                                        }}
                                                    />

                                                </div>
                                            )}

                                            <div className="mb-5">
                                                <label htmlFor="receivers" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Total Receivers
                                                </label>
                                                <p
                                                    id="receivers"
                                                    className="mt-1 block w-full rounded-md border p-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                >
                                                    {selectedRecords.length}
                                                </p>
                                            </div>

                                            <div className="mb-5">
                                                <div className="flex items-center justify-between">
                                                    <label htmlFor="caption" className="block font-medium text-gray-700 dark:text-gray-300">
                                                        Message
                                                    </label>
                                                    <label
                                                        htmlFor="captionEdit"
                                                        className="block font-medium text-blue-700 dark:text-blue-300 cursor-pointer"
                                                        onClick={() => handleEditClick()}
                                                    >
                                                        Edit
                                                    </label>
                                                </div>
                                                {isEditing ? (
                                                    <div className="mt-1">
                                                        <input
                                                            type="text"
                                                            value={caption}
                                                            onChange={handleInputChange}
                                                            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p
                                                        id="caption"
                                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    >
                                                        {items.caption}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mb-5">
                                                <div className="mt-3">
                                                    <label className="flex items-center text-gray-500 dark:text-gray-400">
                                                        <input
                                                            type="checkbox"
                                                            id="trigger"
                                                            className="form-checkbox h-4 w-4 text-gray-600 dark:text-gray-400"
                                                            onChange={(e) => changeValue(e)}
                                                        />
                                                        <span className="ml-2">Create & Trigger</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex justify-end space-x-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 dark:hover:bg-red-900 transition duration-200"
                                                    onClick={() => setRetargetModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                                                    onClick={() => retargetButtonClick()}
                                                >
                                                    Create Campaign
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative">
                        <WhatsAppMessagePreview
                            selectedTemplate={items?.document?.url}
                            selectedRefTemplate={items?.selectedRefTemplate}
                        />
                        <button
                            className="absolute top-2 right-2 text-white bg-black p-2 rounded-full"
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentsAppsCampaignOverview;
