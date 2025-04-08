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
import IconClock from '@/components/icon/icon-clock';
import IconAirplay from '@/components/icon/icon-airplay';
import IconDownload from '@/components/icon/icon-download';
import IconMail from '@/components/icon/icon-mail';
import IconEyeOff from '@/components/icon/icon-eye-off';
import IconCoffee from '@/components/icon/icon-coffee';
import IconTrash from '@/components/icon/icon-trash';

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
        columnAccessor: 'clientName',
        direction: 'asc',
    });

    const [retargetModal, setRetargetModal] = useState<any>(false);
    const [params, setParams] = useState<any>();
    const [date, setDate] = useState<any>(new Date().toISOString().slice(0, 16));
    const [name, setName] = useState(`${items.name} - retarget`);
    const [type, setType] = useState(items.type || 'immediate');
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(items.caption);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupNameSelect, setgroupNameSelect] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [groups, setGroups] = useState<any>();
    const [groupLoading, setGroupLoading] = useState(false);

    //FETCH ALL CAMPAIGNS
    useEffect(() => {
        const getCampaignData = async () => {
            try {
                const campaignResponse = await fetch(apis.getCampaignById, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ _id: _id }),
                });

                const campaignData = await campaignResponse.json();

                if (campaignResponse.status === 401 && campaignData.message === "Token expired! Please login again") {
                    showMessage(campaignData.message, 'error');
                    router.push('/auth/boxed-signin');
                    throw new Error('Token expired');
                }

                if (!campaignResponse.ok) {
                    showMessage(campaignData.message, 'error');
                    throw new Error(`HTTP error! status: ${campaignResponse.status}`);
                }

                setItems(campaignData);
            } catch (error) {
                console.error('Error fetching campaign data:', error);
            }
        };

        getCampaignData();
    }, [_id, token]);

    useEffect(() => {
        if (!_id || !token) return;

        const getData = async () => {
            try {
                const messagesResponse = await fetch(apis.getMessagesForCampaign, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ _id: _id }),
                });

                const messagesData = await messagesResponse.json();
                if (messagesResponse.status === 401 && messagesData.message === "Token expired! Please login again") {
                    showMessage(messagesData.message, 'error');
                    router.push('/auth/boxed-signin');
                    throw new Error('Token expired');
                }

                if (!messagesResponse.ok) {
                    showMessage(messagesData.message, 'error');
                    throw new Error(`HTTP error! status: ${messagesResponse.status}`);
                }
                setDetails(messagesData.data);
            } catch (error) {
                console.error('Error fetching campaign data:', error);
            }
        };

        getData();
    }, [_id, token]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(apis.getAllGroups, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (response.status === 401 && data.message === 'Token expired! Please login again') {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    return;
                }

                if (!response.ok) {
                    showMessage(`HTTP error! status: ${response.status}`, 'error');
                    return;
                }
                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };
        fetchGroups();
    }, [token]);

    useEffect(() => {
        setName(items.name);
    }, [items.name]);

    useEffect(() => {
        setType(items.type || 'immediate');
    }, [items.type]);

    const retargetButtonClick = async () => {
        setLoading(true);

        interface Data {
            name: any;
            type: any;
            audienceIds: any[];
            audience: any;
            countAudience: any;
            messageType: any;
            document: any;
            caption: any;
            button: any;
            schedule?: any;
            groups?: any;
            documentType?: any;
            selectedRefTemplate?: any;
            trigger?: boolean;
        }
        const data: Data = {
            name: name,
            type: type,
            audience: items.audience,
            audienceIds: selectedRecords,
            countAudience: selectedRecords.length,
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
        setLoading(false);
    };

    const runFreezedContacts = async () => {
        setIsLoading(true);
        try {
            const campaign = { ...items, freezedSend: 'yes' };
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
            showMessage(data.message);
            router.push('/apps/create-campaign');
        } catch (error) {
            showMessage('Error Sending Messages, Please Try again', 'error');
        } finally {
            setIsLoading(false);
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
            const newName = value.endsWith(" - retarget") ? value : `${value} - retarget`;
            setName(newName);
        } else if (id === "type") {
            setType(value);
        }
    };

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
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
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportNumberPdf = async () => {
        if (selectedStatus !== "unavailable") {
            if (selectedStatus === "unproceed") {
                await exportCsv(items.unproceedNumbers, 'unproceed_contacts.csv');
            } else {
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
            }
        } else {
            const mobileNumbers = filteredDetails.map((contact: any) => contact.mobileNumber);
            await exportCsv(mobileNumbers, 'unavailable_clients.csv');
        }
    };

    const exportCsv = async (data: any, fileName: string) => {
        try {
            const response = await fetch(apis.exportContacts, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                showMessage('Failed to export contacts', 'error');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);

            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }

            showMessage('Exported Successfully');
        } catch (error) {
            showMessage('Error exporting contacts', 'error');
        }
    };

    const addContactsToGroup = async () => {
        setGroupLoading(true);
        if (!selectedRecords.length || !selectedGroup) {
            showMessage("Please select contacts and a group.", "error");
            setGroupLoading(false);
            return;
        }

        const numbers = selectedRecords;
        const params = {
            numbers: numbers,
            groupId: selectedGroup,
        };

        try {
            const response = await fetch(apis.addContactsToGroup, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message);
            } else {
                showMessage(`Failed to add into group : ${data.message}`, 'error');
            }
        } catch (error: any) {
            showMessage(`An error occurred: ${error.message}`, 'error');
        } finally {
            setSelectedRecords([]);
            setSelectedGroup("");
            setGroupLoading(false);
            setgroupNameSelect(false);
        }
    };

    const deleteNumbers = async () => {
        try {
            if (selectedRecords) {
                const payload = { numbers: selectedRecords };
                const response = await fetch(apis.deleteClients, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    setDetails((details: any) =>
                        details.filter((detail: any) => !selectedRecords.includes(detail.mobileNumber))
                    );
                    setSelectedRecords([]);
                    setSelectedStatus("unavailable");
                    showMessage("Contacts Deleted Successfully");
                } else {
                    showMessage('Failed to delete contacts', 'error');
                }
            } else {
                showMessage('No records selected', 'error');
            }
        } catch (error) {
            showMessage('Error deleting contacts:', 'error');
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const clickBackButton = () => {
        router.push('/apps/create-campaign');
    };

    const handleInputChange = (e: any) => {
        setCaption(e.target.value);
    };

    const filteredDetails = (() => {
        if (selectedStatus === null) {
            return details;
        }

        switch (selectedStatus) {
            case "freezed":
                return items.freezedAudienceIds;

            case "failed":
                return details.filter((item: any) =>
                    item.status === "failed" &&
                    item.reason !== "Failed to send message because this user's phone number is part of an experiment" &&
                    item.reason !== "Message Undeliverable."
                );

            case "unavailable":
                return details.filter((item: any) => item.status === "failed" && item.reason === "Message Undeliverable.");

            case "experiment":
                return details.filter((item: any) => item.status === "failed" && item.reason === "Failed to send message because this user's phone number is part of an experiment");

            default:
                return details.filter((item: any) => item.status === selectedStatus);
        }
    })();

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDetails = filteredDetails?.slice(startIndex, endIndex);

    const isImageUrl = (url: any) => {
        const imageExtensions = ["jpeg", "png"];
        const extension = url?.split(".").pop()?.toLowerCase();
        return imageExtensions.includes(extension);
    };

    const unproceedDetails = items?.unproceedNumbers?.map((number: any, index: any) => ({
        id: index + 1,
        whatsapp_number: number,
    }));

    return (
        <div>
            <div className="flex flex-col gap-5 px-2 md:flex-row md:items-center">
                <button
                    type="button"
                    className="btn p-0 bg-transparent border-0"
                    onClick={() => {
                        clickBackButton();
                    }}
                >
                    <IconArrowBackward className="text-primary" />
                </button>
                <div className="flex items-center gap-2">
                    <b>Campaign Overview</b>
                </div>
                <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-2">
                    {isImageUrl(items?.document?.url) && (
                        <button
                            type="button"
                            className="btn btn-outline-primary gap-2"
                            onClick={() => setIsModalOpen(true)}
                        >
                            View Image
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary gap-2"
                        onClick={handleExportPdf}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <IconSend />
                        )}
                        {isExporting ? "Exporting..." : "Export Overview"}
                    </button>
                </div>
            </div>
            <br />
            <div>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Name", content: `${items.name}`, icon: <IconNotesEdit /> },
                        { label: "Status", content: `${items.status}`, icon: <IconBell /> },
                        { label: "Triggered Campaign", content: `${items.type}`, icon: <IconCalendar /> },
                        {
                            label: "Proceed At",
                            content: `${items.schedule !== "" ?
                                new Date(items.schedule).toLocaleString('en-GB', {
                                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                }) :
                                new Date(items.createdAt).toLocaleString('en-GB', {
                                    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}`,
                            icon: <IconMenuDatatables />
                        },
                        { label: "Message", content: `${items.caption}`, icon: <IconMail /> },
                        { label: "Document Type", content: `${items.messageType === 'utility' ? 'image' : items.documentType}`, icon: <IconMail /> },
                    ].map((item, index) => (
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
                <p className="text-sm ml-2 text-gray-700 font-semibold">
                    Success Ratio :
                    {" "}
                    {items.countAudience > 0
                        ? `${((details.filter((item: any) => ["read", "delivered", "sent"].includes(item.status)).length / items.countAudience) * 100).toFixed(2)}%`
                        : "0%"}
                    {" "}
                    (
                    {details.filter((item: any) => ["read", "delivered", "sent"].includes(item.status)).length} / {items.countAudience}
                    )
                </p>
                <br />
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Overall",
                            value: `${((details.length / items.countAudience) * 100).toFixed(2)}%`,
                            count: details.length + " / " + items.countAudience,
                            icon: <IconListCheck />,
                            status: null,
                        },
                        {
                            label: "Accepted",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "accepted").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "accepted").length,
                            icon: <IconDownload />,
                            status: "accepted",
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
                            label: "Unread",
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
                            label: "Failed",
                            value: details.length > 0
                                ? `${(
                                    (details.filter((item: any) =>
                                        item.status === "failed" &&
                                        item.reason !== "Failed to send message because this user's phone number is part of an experiment" &&
                                        item.reason !== "Message Undeliverable."
                                    ).length / details.length) * 100
                                ).toFixed(2)}%`
                                : "0%",

                            count: details.filter((item: any) =>
                                item.status === "failed" &&
                                item.reason !== "Failed to send message because this user's phone number is part of an experiment" &&
                                item.reason !== "Message Undeliverable."
                            ).length,

                            icon: <IconX />,
                            status: "failed",
                        },
                        {
                            label: "Unavailable on Whatsapp",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "failed" && item.reason === "Message Undeliverable.").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "failed" && item.reason === "Message Undeliverable.").length,
                            icon: <IconEyeOff />,
                            status: "unavailable",
                        },
                        {
                            label: "Experiment Numbers",
                            value: details.length > 0
                                ? `${((details.filter((item: any) => item.status === "failed" && item.reason === "Failed to send message because this user's phone number is part of an experiment").length / details.length) * 100).toFixed(2)}%`
                                : "0%",
                            count: details.filter((item: any) => item.status === "failed" && item.reason === "Failed to send message because this user's phone number is part of an experiment").length,
                            icon: <IconCoffee />,
                            status: "experiment",
                        },
                        {
                            label: "Unproceed Numbers",
                            value: items.unproceedNumbers?.length > 0
                                ? `${((items.unproceedNumbers?.length / items.countAudience) * 100).toFixed(2)}%`
                                : "0%",
                            count: items.unproceedNumbers?.length,
                            icon: <IconEyeOff />,
                            status: "unproceed",
                        },
                    ].map((item, index) => (
                        <div className="panel p-2 flex items-center font-semibold" key={index} onClick={() => { setSelectedStatus(item.status); setSelectedRecords([]); setPage(1); }}>
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
                        <b>Numbers Overview</b>
                    </div>
                    <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-2">
                        <span className="btn btn-outline-success h-10 min-w-[120px] flex items-center justify-center">
                            Total : {details?.length}
                        </span>
                        {(selectedStatus === 'failed' || selectedStatus === 'read' || selectedStatus === 'experiment') &&
                            items?.freezedAudienceIds?.length === 0 && (
                                <button
                                    type="button"
                                    className={`btn btn-primary h-10 min-w-[120px] flex items-center gap-x-2 ${selectedRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        setRetargetModal(true);
                                        setParams(items);
                                        const newName = items.name.endsWith(" - retarget") ? items.name : `${items.name} - retarget`;
                                        setName(newName);
                                        setType(items.type);
                                    }}
                                    disabled={selectedRecords.length === 0}
                                >
                                    <IconPlusCircle />
                                    Re-target
                                </button>
                            )}
                        {items?.freezedAudienceIds?.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-primary h-10 min-w-[120px] flex items-center gap-x-2"
                                    onClick={() => {
                                        setSelectedStatus("freezed");
                                        setSelectedRecords([]);
                                    }}
                                >
                                    Show Freezed Contacts: {items.freezedAudienceIds.length}
                                    <IconClock />
                                </button>
                                {selectedStatus === "freezed" && (
                                    <button
                                        type="button"
                                        className={`btn btn-primary h-10 min-w-[120px] flex items-center gap-x-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={runFreezedContacts}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Trigger for Freezed Contacts
                                                <IconSend />
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                        {selectedStatus === "unavailable" && (
                            <div className="flex gap-x-2">
                                <button
                                    type="button"
                                    className={`btn btn-danger h-10 min-w-[120px] flex items-center gap-x-2 ${selectedRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => deleteNumbers()}
                                    disabled={selectedRecords.length === 0}
                                >
                                    <IconTrash />
                                    Delete
                                </button>

                                <button
                                    type="button"
                                    className={`btn btn-primary h-10 min-w-[120px] flex items-center gap-x-2 ${selectedRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => setgroupNameSelect(true)}
                                    disabled={selectedRecords.length === 0}
                                >
                                    Add to Group
                                    <IconPlusCircle />
                                </button>
                            </div>
                        )}
                        <button
                            type="button"
                            className="btn btn-warning h-10 min-w-[120px] flex items-center gap-x-2"
                            onClick={() => handleExportNumberPdf()}
                        >
                            Export Numbers
                            <IconSend />
                        </button>
                    </div>
                </div>
                <br />
                <div className="datatables pagination-padding">
                    {selectedStatus === "freezed" ?
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={paginatedDetails}
                            columns={[
                                // {
                                //     accessor: 'checkbox',
                                //     title: (
                                //         <input
                                //             type="checkbox"
                                //             checked={isAllSelected}
                                //             onChange={handleSelectAllChange}
                                //         />
                                //     ),
                                //     render: (row: any) => (
                                //         <input
                                //             type="checkbox"
                                //             checked={selectedRecords.includes(row._id)}
                                //             onChange={(e) => {
                                //                 const { checked } = e.target;
                                //                 if (checked) {
                                //                     setSelectedRecords((prev) => [...prev, row._id]);
                                //                 } else {
                                //                     setSelectedRecords((prev) =>
                                //                         prev.filter((id) => id !== row._id)
                                //                     );
                                //                 }
                                //             }}
                                //         />
                                //     ),
                                // },
                                {
                                    accessor: 'name',
                                    sortable: true
                                },
                                {
                                    accessor: 'whatsapp_number',
                                    sortable: true
                                }
                            ]}
                            highlightOnHover
                            totalRecords={filteredDetails.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                        : selectedStatus === "unproceed" ?
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={unproceedDetails}
                                columns={[
                                    // {
                                    //     accessor: 'checkbox',
                                    //     title: (
                                    //         <input
                                    //             type="checkbox"
                                    //             checked={isAllSelected}
                                    //             onChange={handleSelectAllChange}
                                    //         />
                                    //     ),
                                    //     render: (row: any) => (
                                    //         <input
                                    //             type="checkbox"
                                    //             checked={selectedRecords.includes(row._id)}
                                    //             onChange={(e) => {
                                    //                 const { checked } = e.target;
                                    //                 if (checked) {
                                    //                     setSelectedRecords((prev) => [...prev, row._id]);
                                    //                 } else {
                                    //                     setSelectedRecords((prev) =>
                                    //                         prev.filter((id) => id !== row._id)
                                    //                     );
                                    //                 }
                                    //             }}
                                    //         />
                                    //     ),
                                    // },
                                    {
                                        accessor: 'whatsapp_number',
                                        sortable: true
                                    }
                                ]}
                                highlightOnHover
                                totalRecords={items?.unproceedNumbers.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                            />
                            :
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={paginatedDetails}
                                columns={[
                                    {
                                        accessor: 'checkbox',
                                        title: (
                                            <input
                                                type="checkbox"
                                                checked={filteredDetails?.length > 0 && selectedRecords.length === filteredDetails?.length}
                                                onChange={(e) => {
                                                    const { checked } = e.target;
                                                    if (checked) {
                                                        setSelectedRecords(filteredDetails.map((record: any) => record.mobileNumber)); // Select all
                                                    } else {
                                                        setSelectedRecords([]); // Deselect all
                                                    }
                                                }}
                                            />
                                        ),
                                        render: (row: any) => (
                                            <input
                                                type="checkbox"
                                                checked={selectedRecords.includes(row.mobileNumber)}
                                                onChange={(e) => {
                                                    const { checked } = e.target;
                                                    if (checked) {
                                                        setSelectedRecords((prev) => [...prev, row.mobileNumber]);
                                                    } else {
                                                        setSelectedRecords((prev) => prev.filter((id) => id !== row.mobileNumber));
                                                    }
                                                }}
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
                                                sent: 'background-color: #007bff; color: white;', // Blue
                                                delivered: 'background-color: #28a745; color: white;', // Green
                                                read: 'background-color: #17a2b8; color: white;', // Light blue
                                                failed: 'background-color: #dc3545; color: white;', // Red
                                                undelivered: 'background-color: #ffc107; color: black;', // Yellow
                                                acknowledged: 'background-color: #343a40; color: white;', // Dark gray
                                                deleted: 'background-color: #6c757d; color: white;', // Gray
                                                expired: 'background-color: #ffc107; border: 1px solid #ffc107; color: black;', // Outline Yellow
                                                rejected: 'background-color: #dc3545; border: 1px solid #dc3545; color: white;', // Outline Red
                                                pending: 'background-color: #ffc107; color: black;', // Yellow
                                                cancelled: 'background-color: #6c757d; border: 1px solid #6c757d; color: white;', // Outline Gray
                                                default: 'background-color: #f8f9fa; color: black;' // Light Gray for unknown statuses
                                            };

                                            const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;

                                            return (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        ...style.split(';').reduce((acc: any, rule: any) => {
                                                            const [key, value] = rule.split(':').map((s: any) => s.trim());
                                                            if (key) acc[key] = value;
                                                            return acc;
                                                        }, {} as React.CSSProperties)
                                                    }}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        accessor: 'reason',
                                        sortable: true
                                    },
                                ]}
                                highlightOnHover
                                totalRecords={filteredDetails?.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                            />
                    }
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
                                                    onClick={() => { setRetargetModal(false); setLoading(false); }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                                                    onClick={() => retargetButtonClick()}
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
                                                    ) : (
                                                        <>
                                                            <span>Create Campaign</span>
                                                        </>
                                                    )}
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
                    <div
                        className="relative">
                        {items?.selectedRefTemplate && (
                            <WhatsAppMessagePreview
                                selectedTemplate={items?.document?.url}
                                selectedRefTemplate={items?.selectedRefTemplate}
                            />
                        )}
                        {!items?.selectedRefTemplate && (
                            <img className="max-w-full max-h-screen" src={items?.document?.url} alt="Large Preview" />
                        )}
                        <button
                            className="absolute top-2 right-2 text-white bg-black p-2 rounded-full"
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}

            {groupNameSelect && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md animate-fade-in">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Select Group</h2>

                        <div className="mb-4">
                            <label className="block text-gray-600 font-medium mb-2">Choose a Group:</label>
                            <select
                                className="border border-gray-300 rounded px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                            >
                                <option value="">Select Group</option>
                                {groups?.map((group: any) => (
                                    <option key={group.groupId} value={group.groupId}>
                                        {group.name} - {group.groupId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                type="button"
                                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition"
                                onClick={() => {
                                    setgroupNameSelect(false);
                                    setGroupLoading(false);
                                    setSelectedGroup("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg transition text-white ${selectedRecords.length === 0 || !selectedGroup || groupLoading
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                onClick={() => addContactsToGroup()}
                                disabled={selectedRecords.length === 0 || !selectedGroup || groupLoading}
                            >
                                {groupLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            ></path>
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        Add to Group
                                        <IconPlusCircle />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentsAppsCampaignOverview;
