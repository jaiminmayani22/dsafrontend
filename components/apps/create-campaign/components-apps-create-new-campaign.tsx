'use client';

//LIBRARIES
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Flatpickr from 'react-flatpickr';
import Select, { MultiValue } from 'react-select';
import { OptionProps } from 'react-select';
import { useRouter } from 'next/navigation'
import AsyncSelect from "react-select/async";

//ELEMENTS
import IconInfoHexagon from '@/components/icon/icon-info-hexagon';
import IconMail from '@/components/icon/icon-mail';
import IconSend from '@/components/icon/icon-send';
import IconStar from '@/components/icon/icon-star';
import { IRootState } from '@/store';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconArrowForward from '@/components/icon/icon-arrow-forward';

//FILES
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import 'flatpickr/dist/flatpickr.css';
import apis from '../../../public/apis';
import CustomEditor from '../create-template/components-quill-whatsapp';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import IconDesktop from '@/components/icon/icon-desktop';
import IconUser from '@/components/icon/icon-user';
import IconUsersGroup from '@/components/icon/icon-users-group';
import IconMessage from '@/components/icon/icon-message';
import IconSave from '@/components/icon/icon-save';
import IconZipFile from '@/components/icon/icon-zip-file';
import WhatsAppMessagePreview from './components-whatsappPreview';

const ComponentsAppsCreateNewCampaign = () => {
    const router = useRouter();

    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }
    const [isShowMailMenu, setIsShowMailMenu] = useState<any>(false);
    const [isEdit, setIsEdit] = useState<any>(false);
    const [selectedTab, setSelectedTab] = useState<any>('details');
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [date2, setDate2] = useState<any>(new Date().toISOString().slice(0, 16));
    const [selectedAudience, setSelectedAudience] = useState<any>("");
    const [messageType, setMessageType] = useState<any>("");
    const [groupNames, setGroupNames] = useState<any>([]);
    const [contacts, setContacts] = useState<any>([]);
    const [editorText, setEditorText] = useState<any>('');
    const [audienceCount, setAudienceCount] = useState<any>('');
    const [referenceTemplates, setReferenceTemplate] = useState<any>('');
    const [previewImage, setPreviewImage] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [selectedRefTemplate, setSelectedRefTemplate] = useState<any>(null);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [defaultOptions, setDefaultOptions] = useState<any>([]);

    const [sheetUrl, setSheetUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isImported, setIsImported] = useState(false);
    const [importCount, setImportCount] = useState(0);

    //FETCH GROUPS
    useEffect(() => {
        const fetchGroupNames = async () => {
            try {
                const response = await fetch(apis.getAllGroups, {
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
                setGroupNames(data);
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
        };

        fetchGroupNames();
    }, []);

    //get all contacts
    // useEffect(() => {
    //     const fetchAllContacts = async () => {
    //         try {
    //             const response = await fetch(apis.getAllClient, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({
    //                     limit: 0,
    //                 }),
    //             });
    //             const data = await response.json();
    //             if (response.status === 401 && data.message === "Token expired! Please login again") {
    //                 showMessage(data.message, 'error');
    //                 router.push('/auth/boxed-signin');
    //                 throw new Error('Token expired');
    //             }
    //             if (!response.ok) {
    //                 showMessage(data.message, 'error');
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }
    //             console.log("data.data : ", data.data.length)
    //             setContacts(data.data);
    //         } catch (error) {
    //             console.error('Error fetching group names:', error);
    //         }
    //     };

    //     fetchAllContacts();
    // }, []);

    useEffect(() => {
        const fetchInitialContacts = async () => {
            try {
                const response = await fetch(apis.getAllClient, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        limit: 50, // Load first 50 contacts by default
                        pageCount: 1,
                    }),
                });

                const data = await response.json();
                const options = data.data.map((contact: any) => ({
                    value: contact.whatsapp_number,
                    label: `${contact.whatsapp_number} - ${contact.name}`,
                }));

                setDefaultOptions(options);
            } catch (error) {
                console.error('Error fetching initial contacts:', error);
            }
        };

        fetchInitialContacts();
    }, []);

    //FETCH REFERENCE TEMPLATES
    useEffect(() => {
        const fetchReferenceTemplates = async () => {
            try {
                const response = await fetch(apis.getAllReferenceTemplateFormat, {
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
                setReferenceTemplate(data);
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
        };

        fetchReferenceTemplates();
    }, []);

    const [data, setData] = useState<any>({
        name: '',
        type: '',
        schedule: date2,
        receiver: '',
        groups: '',
    });

    //FETCH AUDIENCE COUNT
    useEffect(() => {
        calculateAudience();
    }, [selectedAudience, data.groups]);

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

    type GroupOption = {
        value: string;
        label: string;
    };

    const handleGroupNameChange = (newValue: MultiValue<GroupOption>) => {
        const selectedOptions = newValue as GroupOption[];
        const groupNamesString = selectedOptions.map(option => option.value).join(', ');
        setData((prev: any) => ({
            ...prev,
            groups: groupNamesString,
        }));

    };
    const selectedGroupIds = data.groups ? data.groups.split(', ') : [];

    const handleContactsChange = (newValue: MultiValue<GroupOption>) => {
        const selectedOptions = newValue as GroupOption[];
        const contactsString = selectedOptions.map(option => option.value).join(', ');
        setData((prev: any) => ({
            ...prev,
            quickAudience: contactsString,
        }));
    };
    const selectedContacts = data.quickAudience ? data.quickAudience.split(', ') : [];

    interface CustomOptionProps extends OptionProps<any> {
        data: { label: string; imageUrl: string };
    }

    const CustomOption: React.FC<CustomOptionProps> = ({ innerRef, innerProps, data }) => (
        <div ref={innerRef} {...innerProps} className="flex items-center p-2">
            <img
                src={data.imageUrl}
                alt={data.label}
                style={{ width: 50, height: 50, marginRight: 10, cursor: 'pointer' }}
                onClick={() => handleImageClick(data.imageUrl)} // On image click, show preview
            />
            <span>{data.label}</span>
        </div>
    );

    const handleImageClick = (imageUrl: string) => {
        setPreviewImage(imageUrl);
        setIsModalOpen(true);
    };

    type SelectedOption = {
        data: any;
        imageUrl: string;
    };

    const handleSelectionChange = async (selectedOption: SelectedOption) => {
        const template = selectedOption.data;
        await setSelectedImageUrl(selectedOption.imageUrl);
        await setSelectedRefTemplate(template);
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const saveCampaign = async (send: any) => {
        setLoading(true);
        if (!data.name) {
            showMessage('Campaign name is required', 'error');
            setLoading(false);
            return;
        }

        if (!data.type) {
            showMessage('Campaign type is required', 'error');
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);

        if (data.type === 'schedule' && !date2) {
            showMessage('Schedule date is required for Scheduled Campaigns', 'error');
            setLoading(false);
            return;
        }
        if (data.type === 'schedule') {
            formData.append('schedule', date2);
        }

        if (!selectedAudience) {
            showMessage('Please select Audience', 'error');
            setLoading(false);
            return;
        }
        formData.append('audience', selectedAudience);

        if (selectedAudience === 'group') {
            if (!data.groups || data.groups.length === 0) {
                showMessage('Please select at least one group for Audience', 'error');
                setLoading(false);
                return;
            }
            formData.append('groups', data.groups);
        }

        if (selectedAudience === 'quickAudience') {
            if (!data.quickAudience || data.quickAudience.length === 0) {
                showMessage('Quick audience cannot be empty', 'error');
                setLoading(false);
                return;
            }
            formData.append('quickAudience', data.quickAudience);
        }

        formData.append('messageType', messageType);

        if (!editorText.trim()) {
            showMessage('Caption cannot be empty', 'error');
            setLoading(false);
            return;
        }
        formData.append('caption', editorText);
        formData.append('button', data.button);

        if (send === 'yes') {
            formData.append('send', send);
        }

        if (messageType === 'marketing') {
            if (!data.documentType) {
                showMessage('Document type is required for Marketing Campaigns', 'error');
                setLoading(false);
                return;
            }
            formData.append('documentType', data.documentType);
            formData.append('document', selectedDocument);
        } else {
            if (!selectedTemplate?.file) {
                showMessage('Template file is required', 'error');
                setLoading(false);
                return;
            }
            formData.append('document', selectedTemplate.file);
            formData.append(
                'selectedRefTemplate',
                selectedRefTemplate ? selectedRefTemplate._id : null
            );
        }

        if (selectedAudience === 'sheetsAudience') {
            if (importCount === 0) {
                showMessage('Audience cannot be empty', 'error');
                setLoading(false);
                return;
            }
            formData.append('sheetUrl', sheetUrl);
        }

        try {
            const response = await fetch(
                messageType === 'marketing'
                    ? apis.createCampaignMarketing
                    : apis.createCampaignUtility,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const newTemplate = await response.json();
            if (response.ok) {
                showMessage(newTemplate.message);
            } else {
                setLoading(false);
                showMessage(newTemplate.message, 'error');
            }
            router.push('/apps/create-campaign');
        } catch (error) {
            showMessage("Failed to Create Campaign, PLease try again.", 'error');
            router.push('/apps/create-campaign');
        }
        setLoading(false);
    };

    const handleImageChange = (event: any) => {
        const file = event.target?.files[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            const imageUrl = URL.createObjectURL(file);
            img.src = imageUrl;

            img.onload = () => {
                setSelectedTemplate({
                    data: {
                        height: img.height,
                        width: img.width
                    },
                    file: file,
                    imageUrl: imageUrl,
                });
            };
        }
        setSelectedImageUrl('');
        setSelectedRefTemplate('');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const fileType = file.type;

            if (data.documentType === "image" && !["image/jpeg", "image/png"].includes(fileType)) {
                alert("Please select a valid JPEG or PNG image.");
                event.target.value = "";
                return;
            }

            if (data.documentType === "video" && !["video/mp4", "video/3gp"].includes(fileType)) {
                alert("Please select a valid MP4 or 3GP video.");
                event.target.value = "";
                return;
            }

            if (
                data.documentType === "document" &&
                ![
                    "application/pdf",
                    "application/msword", // .doc
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                    "text/plain", // .txt
                    "application/vnd.ms-excel", // .xls
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                    "application/vnd.ms-powerpoint", // .ppt
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
                ].includes(fileType)
            ) {
                alert("Please select a valid document file (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, or PPTX).");
                event.target.value = "";
                return;
            }
            setSelectedDocument(file);
            setData((prev: any) => ({ ...prev, document: file }));
        }
    };

    const calculateAudience = async () => {
        try {
            let payload: { audience: any; groups?: string } = {
                audience: selectedAudience,
            };
            if (selectedAudience === 'group') {
                payload.groups = data.groups;
            }
            const response = await fetch(apis.campaignAudienceCount, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const resData = await response.json();
            if (!response.ok) {
                showMessage(data.message, 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setAudienceCount(resData.data);
        } catch (error) {
            console.error('Error fetching group names:', error);
        }
    };

    const formattedText = formatTextForDisplay(editorText);
    function formatTextForDisplay(text: any) {
        return text
            .replace(/\*___(.*?)___\*/g, '<strong><em><u>$1</u></em></strong>')   // Bold + Italic + Underline
            .replace(/\*__(.*?)__\*/g, '<strong><u>$1</u></strong>')               // Bold + Underline
            .replace(/\*_(.*?)_\*/g, '<strong><em>$1</em></strong>')               // Bold + Italic
            .replace(/__\*(.*?)\*__/g, '<u><strong>$1</strong></u>')               // Bold + Underline
            .replace(/_(.*?)_/g, '<em>$1</em>')                                     // Italic only
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')                           // Bold only
            .replace(/__(.*?)__/g, '<u>$1</u>')                                     // Underline only
            .replace(/\n/g, '<br>');                                                // Line breaks
    }

    const loadOptions = async (inputValue: any, callback: any) => {
        try {
            const response = await fetch(apis.getAllClient, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    search: inputValue, // Fetch only matching contacts
                    limit: 50, // Load in chunks
                    pageCount: 1,
                }),
            });

            const data = await response.json();
            const options = data.data.map((contact: any) => ({
                value: contact.whatsapp_number,
                label: `${contact.whatsapp_number} - ${contact.name}`,
            }));

            callback(options);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            callback([]);
        }
    };

    const handleImportFromSheet = async () => {
        try {
            setIsImporting(true);
            const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
            if (!sheetIdMatch) {
                alert("Invalid Sheet URL");
                setIsImporting(false);
                return;
            }

            const sheetId = sheetIdMatch[1];
            //https://docs.google.com/spreadsheets/d/e/2PACX-1vScFd6IKizswGLCOVqMyfW1q02ZxaoOaAvzec39UhaBeecKY0Hfwzqi1XbQds42xvgoe6ycVULGbom-/pub?output=csv
            const response = await fetch(
                // `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A2:B?key=${apiKey}`
                `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`
            );

            const csvText = await response.text();
            const rows = csvText.trim().split('\n').slice(1);
            if (rows.length === 0) {
                alert("Sheet fetched but no valid contacts found.");
            } else {
                setIsImported(true);
                setImportCount(rows.length);
                alert(`Sheet fetched successfully with ${rows.length} contacts.`);
            }
        } catch (error) {
            alert("Failed to import contacts.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowMailMenu ? '!block xl:!hidden' : ''}`}
                    onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                ></div>
                <div
                    className={`panel dark:gray-50 absolute z-10 hidden h-full w-[250px] max-w-full flex-none space-y-3 overflow-hidden p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowMailMenu ? '!block' : ''
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'details' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('details');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconMail className="h-5 w-5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Campaign Details</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'audience' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('audience');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconStar className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Audience</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'message' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('message');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconSend className="shrink-0" />

                                        <div className="ltr:ml-3 rtl:mr-3">Message</div>
                                    </div>
                                </button>

                                {messageType === "utility" && (
                                    <button
                                        type="button"
                                        className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'template' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                            }`}
                                        onClick={() => {
                                            setSelectedTab('template');
                                            setSelectedDocument('');
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <IconZipFile className="shrink-0" />
                                            <div className="ltr:ml-3 rtl:mr-3">Template</div>
                                        </div>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'preview' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('preview');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconInfoHexagon className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Preview & Save</div>
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                    </div>
                </div>

                <div className="panel h-full flex-1 overflow-x-hidden p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex flex-wrap-reverse items-center justify-between gap-4 p-4">
                            <div className="flex w-full items-center sm:w-auto">
                                {(() => {
                                    switch (selectedTab) {
                                        case "details":
                                            return (
                                                <form className="space-y-5">
                                                    <div className="flex sm:flex-row flex-col items-start">
                                                        <label htmlFor="campaignName" className="mb-1 sm:w-1/3 sm:ltr:mr-2 rtl:ml-2 text-gray-700 dark:text-gray-300">
                                                            Name
                                                        </label>
                                                        <input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            placeholder="Enter Name"
                                                            value={data.name}
                                                            onChange={handleInputChange}
                                                            className="form-input sm:ml-2 flex-1"
                                                        />
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col items-start">
                                                        <label className="mb-1 sm:w-1/3 sm:ltr:mr-2 rtl:ml-2 text-gray-700 dark:text-gray-300">Campaign Type</label>
                                                        <div className="flex space-x-2 ml-2">
                                                            <div className="inline-flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="type"
                                                                    value="immediate"
                                                                    className="form-radio"
                                                                    checked={data.type === 'immediate'}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300 ml-2">Immediate</span>
                                                            </div>
                                                            <div className="inline-flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="type"
                                                                    value="schedule"
                                                                    className="form-radio"
                                                                    checked={data.type === 'schedule'}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300 ml-2">Schedule</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {data.type === 'schedule' && (
                                                        <div className="flex sm:flex-row flex-col items-start">
                                                            <label
                                                                htmlFor="scheduleTime"
                                                                className="sm:w-1/ sm:ltr:mr-2 rtl:ml-2 text-gray-700 dark:text-gray-300"
                                                            >
                                                                Schedule For
                                                            </label>
                                                            <Flatpickr
                                                                data-enable-time
                                                                options={{
                                                                    enableTime: true,
                                                                    dateFormat: 'Y-m-d H:i',
                                                                    position: isRtl ? 'auto right' : 'auto left',
                                                                    minDate: new Date(),
                                                                }}
                                                                defaultValue={date2}
                                                                className="form-input sm:ml-2 flex-1 ml-2"
                                                                onChange={(date2) => setDate2(date2)}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex sm:flex-row flex-col items-center justify-end space-x-2 mt-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-success flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
                                                            onClick={() => setSelectedTab('audience')}
                                                        >
                                                            Next
                                                            <IconArrowForward />
                                                        </button>
                                                    </div>
                                                </form>
                                            );
                                        case "audience":
                                            return (
                                                <form className="space-y-5">
                                                    <div className="flex sm:flex-row flex-col">
                                                        <label className="sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">Audience</label>
                                                        <div className="flex space-x-4 sm:ml-2">
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="audience"
                                                                        className="form-radio"
                                                                        value="allContacts"
                                                                        checked={selectedAudience === "allContacts"}
                                                                        onChange={() => setSelectedAudience("allContacts")}
                                                                    />
                                                                    <span className="text-white-dark ml-2">All Contacts From CRM</span>
                                                                </label>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="audience"
                                                                        className="form-radio"
                                                                        value="group"
                                                                        checked={selectedAudience === "group"}
                                                                        onChange={() => setSelectedAudience("group")}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Group</span>
                                                                </label>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="audience"
                                                                        className="form-radio"
                                                                        value="favoriteContacts"
                                                                        checked={selectedAudience === "favoriteContacts"}
                                                                        onChange={() => setSelectedAudience("favoriteContacts")}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Favorite Contacts</span>
                                                                </label>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="audience"
                                                                        className="form-radio"
                                                                        value="quickAudience"
                                                                        checked={selectedAudience === "quickAudience"}
                                                                        onChange={() => setSelectedAudience("quickAudience")}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Quick Audience</span>
                                                                </label>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="audience"
                                                                        className="form-radio"
                                                                        value="sheetsAudience"
                                                                        checked={selectedAudience === "sheetsAudience"}
                                                                        onChange={() => setSelectedAudience("sheetsAudience")}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Sheets Audience</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Conditionally render the group selection input if "Group" is selected */}
                                                    {selectedAudience === "group" && (
                                                        <div className="flex sm:flex-row flex-col mt-4">
                                                            <label htmlFor="groupName" className="sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">Select Group</label>
                                                            <Select
                                                                id="groupId"
                                                                placeholder="Select an option"
                                                                options={groupNames?.map((group: any) => ({
                                                                    value: group.groupId,
                                                                    label: `${group.groupId} - ${group.name}`,
                                                                }))}
                                                                isMulti
                                                                onChange={handleGroupNameChange}
                                                                isSearchable={true}
                                                                value={groupNames
                                                                    .filter((group: any) => selectedGroupIds.includes(group.groupId))
                                                                    .map((group: any) => ({
                                                                        value: group.groupId,
                                                                        label: `${group.groupId} - ${group.name}`,
                                                                    }))}
                                                                className="mt-1"
                                                            />
                                                        </div>
                                                    )}
                                                    {selectedAudience === "quickAudience" && (
                                                        <div className="flex flex-col gap-4 mt-4 sm:flex-row">
                                                            <div className="flex flex-col sm:w-3/4">
                                                                <label
                                                                    htmlFor="contacts"
                                                                    className="text-gray-700 font-medium mb-2 sm:mb-0 sm:ltr:mr-2 sm:rtl:ml-2"
                                                                >
                                                                    Select Contacts from Dropdown
                                                                </label>
                                                                {/* <Select
                                                                    id="contacts"
                                                                    placeholder="Select an option"
                                                                    options={contacts?.map((contact: any) => ({
                                                                        value: contact.whatsapp_number,
                                                                        label: `${contact.whatsapp_number} - ${contact.name}`,
                                                                    }))}
                                                                    isMulti
                                                                    onChange={handleContactsChange}
                                                                    isSearchable={true}
                                                                    value={contacts
                                                                        .filter((contact: any) => selectedContacts.includes(contact.whatsapp_number))
                                                                        .map((contact: any) => ({
                                                                            value: contact.whatsapp_number,
                                                                            label: `${contact.whatsapp_number} - ${contact.name}`,
                                                                        }))}
                                                                    className="mt-1"
                                                                /> */}
                                                                <AsyncSelect
                                                                    id="contacts"
                                                                    placeholder="Search and select contacts"
                                                                    loadOptions={loadOptions}
                                                                    defaultOptions={defaultOptions}
                                                                    isMulti
                                                                    onChange={handleContactsChange}
                                                                    isSearchable={true}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div className="sm:w-1/4 mt-1 sm:mt-0">
                                                                <label
                                                                    htmlFor="contacts"
                                                                    className="block text-gray-700"
                                                                >
                                                                    {`Selected Contacts Count: ${selectedContacts.length}`}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedAudience === "sheetsAudience" && (
                                                        <div className="flex flex-col gap-4 mt-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                                                <div className="flex flex-col sm:w-3/4">
                                                                    <label htmlFor="sheetUrl" className="text-gray-700 font-medium mb-1">
                                                                        Enter Google Sheet URL
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        id="sheetUrl"
                                                                        value={sheetUrl}
                                                                        onChange={(e) => setSheetUrl(e.target.value)}
                                                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                                                        className="border rounded px-3 py-2 w-full"
                                                                        disabled={isImporting || isImported}
                                                                    />
                                                                </div>

                                                                <div className="sm:w-1/4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleImportFromSheet}
                                                                        className={`text-white px-4 py-2 rounded mt-1 sm:mt-0 ${isImporting || isImported
                                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                                            : 'bg-blue-600 hover:bg-blue-700'
                                                                            }`}
                                                                        disabled={isImporting || isImported}
                                                                    >
                                                                        {isImporting ? 'Importing...' : isImported ? 'Imported' : 'Import'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {isImported && (
                                                                <p className="text-green-600 text-sm">
                                                                    ✅ Successfully imported {importCount} contacts from Google Sheet.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex sm:flex-row flex-col justify-between">
                                                        <label className="inline-flex mb-0 cursor-pointer">
                                                            <button type="submit" className="btn btn-primary !mt-6" onClick={() => setSelectedTab('details')}>
                                                                <IconArrowBackward></IconArrowBackward>
                                                                Back
                                                            </button>
                                                        </label>
                                                        <label className="inline-flex mb-0 cursor-pointer">
                                                            <button type="button" className="btn btn-success !mt-6" onClick={() => setSelectedTab('message')}>
                                                                Next
                                                                <IconArrowForward></IconArrowForward>
                                                            </button>
                                                        </label>
                                                    </div>
                                                </form>
                                            );
                                        case "message":
                                            return (
                                                <form className="space-y-5 w-full">
                                                    <div className="flex sm:flex-row flex-col items-center w-full">
                                                        <label className="sm:w-1/2 sm:ltr:mr-4 rtl:ml-2 text-gray-700 dark:text-gray-300">Message Type</label>
                                                        <div className="flex space-x-6 w-full">
                                                            <label className="inline-flex items-center cursor-pointer w-full">
                                                                <input
                                                                    type="radio"
                                                                    name="marketing"
                                                                    className="form-radio text-primary focus:ring-primary"
                                                                    value="marketing"
                                                                    checked={messageType === "marketing"}
                                                                    onChange={() => {
                                                                        setMessageType("marketing");
                                                                        setSelectedTemplate('');
                                                                        setSelectedRefTemplate('');
                                                                    }}
                                                                />
                                                                <span className="text-gray-600 dark:text-gray-300">Marketing</span>
                                                            </label>
                                                            <label className="inline-flex items-center cursor-pointer w-full">
                                                                <input
                                                                    type="radio"
                                                                    name="utility"
                                                                    className="form-radio text-primary focus:ring-primary"
                                                                    value="utility"
                                                                    checked={messageType === "utility"}
                                                                    onChange={() => {
                                                                        setMessageType("utility");
                                                                        setSelectedDocument('');
                                                                    }}
                                                                />
                                                                <span className=" text-gray-600 dark:text-gray-300">Utility</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {messageType === "marketing" && (
                                                        <>
                                                            <div className="flex sm:flex-row flex-col items-center w-full">
                                                                <label className="sm:w-1/2 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">File Type</label>
                                                                <Select
                                                                    placeholder="Select an option"
                                                                    className="w-full sm:ml-2"
                                                                    options={[
                                                                        { value: 'text', label: 'Text' },
                                                                        { value: 'image', label: 'Image' },
                                                                        { value: 'video', label: 'Video' },
                                                                        { value: 'document', label: 'Document' },
                                                                    ]}
                                                                    value={data.documentType ? { value: data.documentType, label: data.documentType.charAt(0).toUpperCase() + data.documentType.slice(1) } : null}
                                                                    onChange={(selectedOption: any) => {
                                                                        setData((prev: any) => ({ ...prev, 'documentType': selectedOption?.value }));
                                                                        setSelectedDocument("");
                                                                        setData((prev: any) => ({ ...prev, document: null }));
                                                                    }}
                                                                />
                                                            </div>

                                                            {(data.documentType !== "text") && (
                                                                <div className="flex sm:flex-row flex-col items-center w-full">
                                                                    <label className="sm:w-1/2 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">File</label>
                                                                    <input
                                                                        ref={fileInputRef}
                                                                        id="ctnFile"
                                                                        type="file"
                                                                        className="form-input sm:ml-2 w-full file:py-2 file:px-4 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file:ml-5 file:text-white hover:file:bg-primary"
                                                                        required
                                                                        accept={
                                                                            data.documentType === "image"
                                                                                ? "image/jpeg,image/png"
                                                                                : data.documentType === "video"
                                                                                    ? "video/mp4,video/3gp"
                                                                                    : data.documentType === "document"
                                                                                        ? ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                                                                                        : ""
                                                                        }
                                                                        onChange={(event) => handleFileChange(event)}
                                                                    />
                                                                </div>
                                                            )}
                                                            {data.document && (
                                                                <div className="flex items-center w-full px-3 py-2">
                                                                    <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300"></label>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate ml-6">
                                                                        <b>Selected file:</b> {data?.document?.name}
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        className="text-red-600 hover:text-red-800 ml-2 text-sm"
                                                                        onClick={() => {
                                                                            setSelectedDocument("");
                                                                            setData((prev: any) => ({ ...prev, document: null }));
                                                                        }}
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div className="flex sm:flex-row flex-col items-center w-full">
                                                        <label className="sm:w-1/2 sm:ltr:mr-2 rtl:ml-2 text-gray-700 dark:text-gray-300">
                                                            Caption
                                                        </label>
                                                        <div className="flex w-full max-w-xl overflow-hidden">
                                                            <CustomEditor
                                                                value={editorText}
                                                                onChange={(text: string) => {
                                                                    setEditorText(text);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col justify-between mt-6 w-full">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                            onClick={() => setSelectedTab('audience')}
                                                        >
                                                            <IconArrowBackward />
                                                            Back
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-success flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
                                                            onClick={() => setSelectedTab(messageType === "utility" ? "template" : "preview")}
                                                        >
                                                            Next
                                                            <IconArrowForward />
                                                        </button>
                                                    </div>
                                                </form>
                                            );
                                        case "template":
                                            return (
                                                <form className="space-y-5">
                                                    <div className="flex sm:flex-row flex-col items-center">
                                                        <label className="sm:w-1/2 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Choose Template</label>
                                                        <input
                                                            ref={fileInputRef}
                                                            id="template"
                                                            name="template"
                                                            type="file"
                                                            accept="image/*"
                                                            className="form-input sm:ml-2 w-full file:py-2 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file-ml-5 file:text-white hover:file:bg-primary"
                                                            required
                                                            onChange={handleImageChange}
                                                        />
                                                        <label className="w-full ml-2 text-gray-700 dark:text-gray-300">
                                                            {selectedTemplate
                                                                ? `${Number(selectedTemplate.data.height)} x ${Number(selectedTemplate.data.width)}`
                                                                : ""}
                                                        </label>
                                                    </div>
                                                    {selectedTemplate && (
                                                        <div className="flex items-center">
                                                            <label className="sm:w-1/4 sm:ltr:mr-1 rtl:ml-4 text-gray-700 dark:text-gray-300"></label>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                                <b>Selected Template :</b> {selectedTemplate.file.name}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                className="text-red-600 hover:text-red-800"
                                                                onClick={() => {
                                                                    setSelectedTemplate('');
                                                                    setSelectedImageUrl('');
                                                                }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    )}

                                                    {selectedTemplate && (
                                                        <div className="flex sm:flex-row flex-col items-center">
                                                            <label className="sm:w-1/2 sm:ltr:mr-2 rtl:ml-2 text-gray-700 dark:text-gray-300">Reference Template</label>
                                                            <Select
                                                                placeholder="Select an option"
                                                                className="w-full sm:ml-2"
                                                                options={referenceTemplates?.filter(
                                                                    (template: any) =>
                                                                        Number(template.width) === Number(selectedTemplate.data.width) &&
                                                                        Number(template.height) === Number(selectedTemplate.data.height))
                                                                    .map((template: any) => ({
                                                                        value: template._id,
                                                                        label: template.name,
                                                                        imageUrl: template.templateFormat.url,
                                                                        data: template,
                                                                    }))
                                                                }
                                                                components={{ Option: CustomOption }}
                                                                onChange={handleSelectionChange}
                                                                value={referenceTemplates
                                                                    .filter(
                                                                        (template: any) =>
                                                                            Number(template.width) === Number(selectedTemplate.data.width) &&
                                                                            Number(template.height) === Number(selectedTemplate.data.height)
                                                                    )
                                                                    .map((template: any) => ({
                                                                        value: template._id,
                                                                        label: template.name,
                                                                        imageUrl: template.templateFormat.url,
                                                                        data: template,
                                                                    }))
                                                                    .find((option: any) => option.value === selectedRefTemplate.name)
                                                                }
                                                            />
                                                            <label className="ml-2 w-full text-gray-700 dark:text-gray-300">
                                                                {selectedRefTemplate ? `${Number(selectedRefTemplate.height)} x ${Number(selectedRefTemplate.width)}` : ""}
                                                            </label>
                                                        </div>
                                                    )}

                                                    <div className="flex sm:flex-row flex-col justify-between mt-6">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                            onClick={() => setSelectedTab('message')}>
                                                            <IconArrowBackward />
                                                            Back
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-success flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
                                                            onClick={() => setSelectedTab('preview')}>
                                                            Next
                                                            <IconArrowForward />
                                                        </button>
                                                    </div>
                                                </form>
                                            );
                                        case "preview":
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                                    {/* Left Side */}
                                                    <form className="space-y-5">
                                                        <div className="space-y-5">
                                                            <div className="text-lg font-semibold">Preview & Save</div>

                                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                                                                {/* Campaign Name */}
                                                                <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
                                                                    <IconMenuDocumentation className="text-4xl text-blue-600 mr-4" />
                                                                    <div className="text-left">
                                                                        <div className="text-xl font-semibold text-gray-800">{data.name}</div>
                                                                        <div className="text-sm font-light text-gray-400">Campaign Name</div>
                                                                    </div>
                                                                </div>

                                                                {/* Trigger Campaign */}
                                                                <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
                                                                    <IconDesktop className="text-4xl text-green-600 mr-4" />
                                                                    <div className="text-left">
                                                                        <div className="text-xl font-semibold text-gray-800">{data.type}</div>
                                                                        <div className="text-sm font-light text-gray-400">Trigger Campaign</div>
                                                                    </div>
                                                                </div>

                                                                {/* Audience Type */}
                                                                <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
                                                                    <IconUser className="text-4xl text-purple-600 mr-4" />
                                                                    <div className="text-left">
                                                                        <div className="text-xl font-semibold text-gray-800">
                                                                            {(() => {
                                                                                const formatAudience = (audience: any) => {
                                                                                    switch (audience) {
                                                                                        case 'allContacts':
                                                                                            return 'All Contacts';
                                                                                        case 'group':
                                                                                            return 'Group';
                                                                                        case 'favoriteContacts':
                                                                                            return 'Favorite Contacts';
                                                                                        case 'quickAudience':
                                                                                            return 'Quick Audience';
                                                                                        default:
                                                                                            return audience;
                                                                                    }
                                                                                };
                                                                                return formatAudience(selectedAudience);
                                                                            })()}
                                                                        </div>
                                                                        <div className="text-sm font-light text-gray-400">Audience Type</div>
                                                                    </div>
                                                                </div>

                                                                {/* Audience Size */}
                                                                <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
                                                                    <IconUsersGroup className="text-4xl text-yellow-600 mr-4" />
                                                                    <div className="text-left">
                                                                        <div className="text-xl font-semibold text-gray-800">{audienceCount ? audienceCount : selectedContacts.length ? selectedContacts.length : importCount}</div>
                                                                        <div className="text-sm font-light text-gray-400">Audience Size</div>
                                                                    </div>
                                                                </div>

                                                                {/* Messages */}
                                                                <div className="flex items-center p-6 bg-white rounded-lg shadow-md">
                                                                    <IconMessage className="text-4xl text-red-600 mr-4" />
                                                                    <div className="text-left">
                                                                        <div className="text-xl font-semibold text-gray-800">{messageType}</div>
                                                                        <div className="text-sm font-light text-gray-400">Messages</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between mt-6 space-y-4 sm:space-y-0">
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                                    onClick={() => saveCampaign('')}
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
                                                                            <IconSave />
                                                                            <span>Save Campaign</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                                {/* {data.type === 'immediate' && (
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
                                                                        onClick={() => saveCampaign('yes')}
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
                                                                                <IconSend />
                                                                                Save & Send Campaign
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )} */}
                                                            </div>
                                                        </div>
                                                    </form>

                                                    <div className="whatsapp-message bg-green-100 overflow-hidden w-full max-w-md mx-auto p-2 shadow-md">
                                                        <div className="flex items-start">
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>

                                                            <div className="ml-3 flex-1">
                                                                <div className="bg-white p-3 w-full flex flex-col justify-between shadow rounded-lg">
                                                                    {(selectedDocument || data.document) &&
                                                                        !selectedTemplate &&
                                                                        data?.document?.type?.startsWith("image/") && (
                                                                            <img
                                                                                src={URL.createObjectURL(data?.document)}
                                                                                alt="preview"
                                                                                className="w-full max-h-96 object-contain rounded"
                                                                            />
                                                                        )}

                                                                    {(selectedDocument || data.document) &&
                                                                        !selectedTemplate &&
                                                                        data?.document?.type?.startsWith("video/") && (
                                                                            <video
                                                                                src={URL.createObjectURL(data?.document)}
                                                                                controls
                                                                                className="w-full max-h-96 object-contain rounded"
                                                                            />
                                                                        )}

                                                                    {(selectedDocument || data.document) &&
                                                                        !selectedTemplate &&
                                                                        data?.document?.type?.startsWith("application/") && (
                                                                            <iframe
                                                                                src={URL.createObjectURL(data?.document)}
                                                                                className="w-full max-h-96 object-contain rounded"
                                                                            ></iframe>
                                                                        )}

                                                                    {selectedTemplate && selectedRefTemplate && !selectedDocument && (
                                                                        <WhatsAppMessagePreview
                                                                            selectedTemplate={selectedTemplate}
                                                                            selectedRefTemplate={selectedRefTemplate}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="mt-2 text-gray-800 text-sm">
                                                                    <p
                                                                        dangerouslySetInnerHTML={{ __html: formattedText }}
                                                                        className="whitespace-normal break-words break-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        default:
                                            return null; // No content if no tab is selected
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative">
                        <button onClick={() => setIsModalOpen(false)}>Close</button>
                        <img src={previewImage} alt="Preview" style={{ width: '100%', height: 'auto' }} className="max-w-full max-h-screen" />
                        <button
                            className="absolute top-2 right-2 text-white bg-black p-2 rounded-full"
                            onClick={() => setIsModalOpen(false)}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default ComponentsAppsCreateNewCampaign;
