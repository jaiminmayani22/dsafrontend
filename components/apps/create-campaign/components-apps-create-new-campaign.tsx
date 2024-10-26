'use client';

//LIBRARIES
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Flatpickr from 'react-flatpickr';
import Select, { MultiValue } from 'react-select';
import { OptionProps } from 'react-select';

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
    const token = localStorage.getItem('authToken');

    const [isShowMailMenu, setIsShowMailMenu] = useState<any>(false);
    const [isEdit, setIsEdit] = useState<any>(false);
    const [selectedTab, setSelectedTab] = useState<any>('details');
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [date2, setDate2] = useState<any>(new Date().toISOString().slice(0, 16));
    const [selectedAudience, setSelectedAudience] = useState<any>("");
    const [messageType, setMessageType] = useState<any>("");
    const [groupNames, setGroupNames] = useState<any>([]);
    const [editorText, setEditorText] = useState<any>('');
    const [audienceCount, setAudienceCount] = useState<any>('');
    const [referenceTemplates, setReferenceTemplate] = useState<any>('');
    const [previewImage, setPreviewImage] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [selectedRefTemplate, setSelectedRefTemplate] = useState<any>(null);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

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

    //FETCH AUDIENCE COUNT
    useEffect(() => {
        calculateAudience();
    }, [selectedAudience]);

    const [data, setData] = useState<any>({
        name: '',
        type: '',
        schedule: date2,
        receiver: '',
        groups: '',
    });

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
            groupId: groupNamesString,
        }));
    };
    const selectedGroupIds = data.groups ? data.groups.split(', ') : [];

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
        if (messageType === 'marketing') {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('type', data.type);
            if (data.type === 'schedule') {
                formData.append('schedule', date2);
            }
            formData.append('audience', selectedAudience);
            if (selectedAudience === "group") {
                formData.append('groups', data.groups);
            }
            formData.append('messageType', messageType);
            formData.append('documentType', data.documentType);
            formData.append('document', selectedDocument);
            formData.append('caption', editorText);
            formData.append('button', data.button);
            if (send === 'yes') {
                formData.append('send', send);
            }
            // const logFormData = (formData) => {
            //     for (let [key, value] of formData.entries()) {
            //         console.log(`${key}: ${value instanceof File ? value.name : value}`);
            //     }
            // };
            // logFormData(formData);

            try {
                const response = await fetch(apis.createCampaignMarketing, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const newTemplate = await response.json();
                if (response.ok) {
                    showMessage(newTemplate.message);
                } else {
                    showMessage(newTemplate.message, 'error');
                }
            } catch (error) {
                showMessage('Error uploading template', 'error');
            }
        } else {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('type', data.type);
            if (data.type === 'schedule') {
                formData.append('schedule', date2);
            }
            formData.append('audience', selectedAudience);
            if (selectedAudience === "group") {
                formData.append('groups', data.groups);
            }
            formData.append('messageType', messageType);
            formData.append('document', selectedTemplate.file);
            formData.append('selectedRefTemplate', selectedRefTemplate ? selectedRefTemplate._id : null); // Make sure to append the _id
            formData.append('caption', editorText);
            formData.append('button', data.button);
            if (send === 'yes') {
                formData.append('send', send);
            }
            // const logFormData = (formData) => {
            //     for (let [key, value] of formData.entries()) {
            //         console.log(`${key}: ${value instanceof File ? value.name : value}`);
            //     }
            // };
            // logFormData(formData);

            try {
                const response = await fetch(apis.createCampaignUtility, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                const newTemplate = await response.json();
                if (response.ok) {
                    showMessage(newTemplate.message);
                } else {
                    showMessage(newTemplate.message, 'error');
                }
            } catch (error) {
                showMessage('Error uploading template', 'error');
            }
        }
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
        setSelectedImageUrl("");
        setSelectedRefTemplate("");
    };

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
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
                        <div className="pb-5">
                            <button className="btn btn-primary w-full" type="button">
                                Add Message
                            </button>
                        </div>
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
                                                    <div className="flex sm:flex-row flex-col">
                                                        <label htmlFor="campaignName" className="mb-0 sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">
                                                            Campaign Name
                                                        </label>
                                                        <input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            placeholder="Enter Name"
                                                            value={data.name}
                                                            onChange={handleInputChange}
                                                            className="form-input flex-1 sm:ml-2"
                                                        />
                                                    </div>
                                                    <div className="flex sm:flex-row flex-col">
                                                        <label className="sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">Campaign Type</label>
                                                        <div className="flex space-x-4 sm:ml-2">
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="type"
                                                                        value="immediate"
                                                                        className="form-radio"
                                                                        checked={data.type === 'immediate'}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Immediate</span>
                                                                </label>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="inline-flex mt-1 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="type"
                                                                        value="schedule"
                                                                        className="form-radio"
                                                                        checked={data.type === 'schedule'}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span className="text-white-dark ml-2">Schedule</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {data.type === 'schedule' && (
                                                        <div className="flex sm:flex-row flex-col">
                                                            <label htmlFor="scheduleTime" className="mb-0 sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">
                                                                Schedule For
                                                            </label>
                                                            <Flatpickr
                                                                data-enable-time
                                                                options={{
                                                                    enableTime: true,
                                                                    dateFormat: 'Y-m-d H:i',
                                                                    position: isRtl ? 'auto right' : 'auto left',
                                                                }}
                                                                defaultValue={date2}
                                                                className="form-input sm:ml-2 flex-1"
                                                                onChange={(date2) => setDate2(date2)}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex sm:flex-row flex-col">
                                                        <label className="font-semibold sm:w-1/4 sm:ltr:mr-2 rtl:ml-2"> </label>
                                                        <label className="inline-flex mb-0 cursor-pointer">
                                                            <button type="button" className="btn btn-success !mt-6" onClick={() => setSelectedTab('audience')}>
                                                                Next
                                                                <IconArrowForward></IconArrowForward>
                                                            </button>
                                                        </label>
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
                                                                isSearchable={false}
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
                                                <form className="space-y-5">
                                                    <div className="flex sm:flex-row flex-col items-center">
                                                        <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Message Type</label>
                                                        <div className="flex space-x-6 sm:ml-2">
                                                            <label className="inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="marketing"
                                                                    className="form-radio text-primary focus:ring-primary"
                                                                    value="marketing"
                                                                    checked={messageType === "marketing"}
                                                                    onChange={() => setMessageType("marketing")}
                                                                />
                                                                <span className="ml-2 text-gray-600 dark:text-gray-300">Marketing</span>
                                                            </label>
                                                            <label className="inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="utility"
                                                                    className="form-radio text-primary focus:ring-primary"
                                                                    value="utility"
                                                                    checked={messageType === "utility"}
                                                                    onChange={() => setMessageType("utility")}
                                                                />
                                                                <span className="ml-2 text-gray-600 dark:text-gray-300">Utility</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {messageType === "marketing" && (
                                                        <>
                                                            <div className="flex sm:flex-row flex-col items-center">
                                                                <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Regular Message Type</label>
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
                                                                    onChange={(selectedOption) => setData((prev: any) => ({ ...prev, 'documentType': selectedOption?.value }))}
                                                                />
                                                            </div>

                                                            <div className="flex sm:flex-row flex-col items-center">
                                                                <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">File</label>
                                                                <input
                                                                    id="ctnFile"
                                                                    type="file"
                                                                    className="form-input sm:ml-2 w-full file:py-2 file:px-4 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file-ml-5 file:text-white hover:file:bg-primary"
                                                                    required
                                                                    onChange={(event: any) => handleFileChange(event)}
                                                                />
                                                                {data.document && (
                                                                    <div className="mt-2">
                                                                        <p> <b>Selected file:</b> {data.document.name}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex sm:flex-row flex-col items-center">
                                                        <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Caption</label>
                                                        <CustomEditor
                                                            value={editorText}
                                                            onChange={(text: string) => setEditorText(text)}
                                                        />
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col items-center">
                                                        <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Button</label>
                                                        <Select
                                                            placeholder="Select an option"
                                                            className="w-full sm:ml-2"
                                                            options={[
                                                                { value: 'button', label: 'Interactive (Button)' },
                                                                { value: 'list', label: 'Interactive (List)' },
                                                            ]}
                                                            onChange={(selectedValue) => setData((prev: any) => ({ ...prev, 'button': selectedValue }))}
                                                            value={data.button}
                                                        />
                                                    </div>

                                                    <div className="flex sm:flex-row flex-col justify-between mt-6">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                            onClick={() => setSelectedTab('audience')}>
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
                                        case "template":
                                            return (
                                                <form className="space-y-5">
                                                    <div className="flex sm:flex-row flex-col items-center">
                                                        <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Choose Template</label>
                                                        <input
                                                            id="template"
                                                            name="template"
                                                            type="file"
                                                            accept="image/*"
                                                            className="form-input sm:ml-2 w-full file:py-2 file:px-4 file:border-0 file:font-semibold p-0 file:bg-primary/90 ltr:file:mr-5 rtl:file-ml-5 file:text-white hover:file:bg-primary"
                                                            required
                                                            onChange={handleImageChange}
                                                        />
                                                        <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">
                                                            {selectedTemplate
                                                                ? `${Number(selectedTemplate.data.height)} x ${Number(selectedTemplate.data.width)}`
                                                                : "No template selected"}
                                                        </label>
                                                        {selectedTemplate && (
                                                            <div className="mt-2">
                                                                <p> <b>Selected file:</b> {selectedTemplate.file.name}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {selectedTemplate && (
                                                        <div className="flex sm:flex-row flex-col items-center">
                                                            <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">Reference Template</label>
                                                            <Select
                                                                placeholder="Select an option"
                                                                className="w-full sm:ml-2"
                                                                options={referenceTemplates
                                                                    .filter((template: any) =>
                                                                        Number(template.width) === Number(selectedTemplate.data.width) &&
                                                                        Number(template.height) === Number(selectedTemplate.data.height)
                                                                    )
                                                                    .map((template: any) => ({
                                                                        value: template._id,
                                                                        label: template.name,
                                                                        imageUrl: template.templateFormat.url,
                                                                        data: template
                                                                    }))
                                                                }
                                                                components={{ Option: CustomOption }}
                                                                onChange={handleSelectionChange}
                                                                value={selectedRefTemplate}
                                                            />
                                                            <label className="sm:w-1/4 sm:ltr:mr-4 rtl:ml-4 text-gray-700 dark:text-gray-300">
                                                                {selectedRefTemplate ? `${Number(selectedRefTemplate.height)} x ${Number(selectedRefTemplate.width)}` : "No template selected"}
                                                            </label>
                                                        </div>
                                                    )}

                                                    <div className="flex mt-4 space-x-4">
                                                        {selectedTemplate && (
                                                            <div className="w-1/2 border border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center">
                                                                <h3 className="text-center mb-2 font-bold">Selected Template</h3>
                                                                <img
                                                                    src={selectedTemplate.imageUrl}
                                                                    alt="Selected Template"
                                                                    style={{ width: '100%', height: 'auto', maxWidth: 270 }}
                                                                />
                                                            </div>
                                                        )}
                                                        {selectedImageUrl && (
                                                            <div className="w-1/2 border border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center">
                                                                <h3 className="text-center mb-2 font-bold">Selected Ref Format</h3>
                                                                <img
                                                                    src={selectedImageUrl}
                                                                    alt="Selected Ref Format"
                                                                    style={{ width: '100%', height: 'auto', maxWidth: 270 }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

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

                                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                                <div className="panel flex items-center p-4 bg-white rounded-lg shadow-md">
                                                                    <IconMenuDocumentation className="text-4xl text-blue-600" />
                                                                    <div className="ml-4 text-right">
                                                                        <div className="text-xl font-bold">{data.name}</div>
                                                                        <div className="text-sm font-light text-gray-400">Campaign Name</div>
                                                                    </div>
                                                                </div>

                                                                <div className="panel flex items-center p-4 bg-white rounded-lg shadow-md">
                                                                    <IconDesktop className="text-4xl text-green-600" />
                                                                    <div className="ml-4 text-right">
                                                                        <div className="text-xl font-bold">{data.type}</div>
                                                                        <div className="text-sm font-light text-gray-400">Trigger Campaign</div>
                                                                    </div>
                                                                </div>

                                                                <div className="panel flex items-center p-4 bg-white rounded-lg shadow-md">
                                                                    <IconUser className="text-4xl text-purple-600" />
                                                                    <div className="ml-4 text-right">
                                                                        <div className="text-xl font-bold">{selectedAudience}</div>
                                                                        <div className="text-sm font-light text-gray-400">Audience Type</div>
                                                                    </div>
                                                                </div>

                                                                <div className="panel flex items-center p-4 bg-white rounded-lg shadow-md">
                                                                    <IconUsersGroup className="text-4xl text-yellow-600" />
                                                                    <div className="ml-4 text-right">
                                                                        <div className="text-xl font-bold">{audienceCount}</div>
                                                                        <div className="text-sm font-light text-gray-400">Audience Size</div>
                                                                    </div>
                                                                </div>

                                                                <div className="panel flex items-center p-4 bg-white rounded-lg shadow-md">
                                                                    <IconMessage className="text-4xl text-red-600" />
                                                                    <div className="ml-4 text-right">
                                                                        <div className="text-xl font-bold">{messageType}</div>
                                                                        <div className="text-sm font-light text-gray-400">Messages</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between mt-6 space-y-4 sm:space-y-0">
                                                                <button
                                                                    type="button"
                                                                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                                    onClick={() => saveCampaign('')}
                                                                >
                                                                    <IconSave />
                                                                    Save Campaign
                                                                </button>

                                                                {data.type === 'immediate' && (
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-300"
                                                                        onClick={() => saveCampaign('yes')}
                                                                    >
                                                                        <IconSend />
                                                                        Save & Send Campaign
                                                                    </button>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </form>

                                                    {/* Right Side (WhatsApp Preview) */}
                                                    <div className="panel p-4 bg-white rounded-lg shadow-md">
                                                        {/* <div className="whatsapp-preview bg-gray-100 p-4 rounded-lg shadow-lg"> */}
                                                        <div className="whatsapp-message bg-green-50 rounded-lg overflow-hidden">
                                                            {/* {(selectedTemplate || data.document) && (
                                                                    <img
                                                                        src={URL.createObjectURL(selectedTemplate?.file || data?.document)}
                                                                        alt="preview"
                                                                        className="w-full object-cover"
                                                                    />
                                                                )} */}
                                                            <WhatsAppMessagePreview
                                                                selectedTemplate={selectedTemplate}
                                                                selectedRefTemplate={selectedRefTemplate}
                                                            />
                                                            <div className="p-3 text-gray-800 text-base">
                                                                <p>{editorText}</p>
                                                            </div>
                                                        </div>
                                                        {/* </div> */}
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
            )}
        </div>
    );
};

export default ComponentsAppsCreateNewCampaign;