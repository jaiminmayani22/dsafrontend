'use client';

//LIBRARIES
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { sortBy } from 'lodash';
import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'

//COMPONENETS
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconSend from '@/components/icon/icon-send';
import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import Dropdown from '@/components/dropdown';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import { IRootState } from '@/store';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Transition, Dialog } from '@headlessui/react';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';

//FILES
import apis from '../../../public/apis';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import { AnyARecord } from 'dns';

const PAGE_SIZES = [10, 20, 50];

const ComponentsAppsGroups = () => {
    const router = useRouter();
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedGroups, setSelectedGroups] = useState<any>(null);

    const [groupList, setGroups] = useState<any>([]);
    const [addGroupModal, setAddGroupModal] = useState<any>(false);
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [newAdd, setNewAdd] = useState<any>(false);
    const [viewUserModal, setViewUserModal] = useState<any>(false);
    const [page, setPage] = useState<any>(1); // Current page
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]); // Records per page
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [errors, setErrors] = useState<any>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [isInvalidModalOpen, setIsInvalidModalOpen] = useState(false);
    const [invalidEntries, setInvalidEntries] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorMessages, setErrorMessages] = useState({ mobile: '', whatsapp: '' });
    const [loading, setLoading] = useState(false);
    const [isCompanyLoading, setIsCompanyLoading] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    const [defaultParams] = useState<any>({
        _id: null,
        name: '',
        groupId: '',
        remarks: '',
        addedBy: '',
        createdAt: '',
        updatedAt: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [members, setMembers] = useState<any>([]);
    const [paginatedDetails, setPaginatedDetails] = useState([]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const [filteredItems, setFilteredItems] = useState<any>([]);
    const [contacts, setContacts] = useState<any>([]);
    const [search, setSearch] = useState<any>('');
    const [searchClient, setSearchClient] = useState<any>('');

    const searchContact = (e: any) => {
        const event = e.target.value;
        setFilteredItems(() => {
            return members?.filter((item: any) => {
                return item.name.toLowerCase().includes(event.toLowerCase());
            });
        });
    };

    //get all  groups
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(apis.getAllGroups, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });
                const data = await response.json();

                if (response.status === 401 && data.message === 'Token expired! Please login again') {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                setGroups(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        const fetchMembers = async () => {
            try {
                const response = await fetch(apis.getMembersForGroup, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ groupId: selectedGroup }),
                });

                if (response.ok) {
                    const memberArr = await response.json();
                    setMembers(memberArr);
                } else {
                    showMessage('Members not Found', 'error');
                }
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        if (selectedGroup === null) {
            fetchGroups();
        } else {
            fetchMembers();
        }
    }, [selectedGroup, params, token, apis]);

    useEffect(() => {
        const updatePaginatedDetails = () => {
            let updatedItems = selectedGroup === null ? groupList : members;

            if (searchQuery.trim() !== '') {
                updatedItems = updatedItems.filter((item: any) =>
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            if (sortStatus.columnAccessor) {
                updatedItems = sortBy(updatedItems, sortStatus.columnAccessor);
                if (sortStatus.direction === 'desc') {
                    updatedItems = updatedItems.reverse();
                }
            }

            setFilteredItems(updatedItems);

            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = updatedItems.slice(from, to);

            setPaginatedDetails(paginated);
        };

        updatePaginatedDetails();
    }, [searchQuery, selectedGroup, groupList, members, sortStatus, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    useEffect(() => {
        if (selectedGroup === null) {
            setPage(1);
        }
    }, [selectedGroup]);

    const saveGroup = async () => {
        setLoading(true);

        if (!params.name) {
            showMessage('Name is required.', 'error');
            setLoading(false);
            return true;
        }
        try {
            if (params._id) {
                const response = await fetch(`${apis.updateGroupById}${params._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });

                const data = await response.json();

                if (response.ok) {
                    let group = filteredItems.find((d: any) => d._id === params._id);
                    Object.assign(group, params);
                    showMessage('Group has been updated successfully.');
                } else {
                    showMessage(`Failed to update user: ${data.message}`, 'error');
                }
            } else {
                const response = await fetch(apis.createGroup, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });
                const data = await response.json();
                if (response.ok) {
                    setFilteredItems([...filteredItems, data.data]);
                    filteredItems.splice(0, 0, data.data);
                    showMessage('Group has been added successfully.');
                } else {
                    showMessage(`Failed to add Group: ${data.message}`, 'error');
                }
            }
        } catch (error) {
            showMessage(`Error: ${(error as Error).message}`, 'error');
        }
        setLoading(false);
        setAddGroupModal(false);
    };

    const editGroup = (groupId: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (groupId) {
            const group = filteredItems.find((u: any) => u.groupId === groupId);
            setParams(group);
        }
        setAddGroupModal(true);
    };

    const viewGroup = (groupId: any = null) => {
        setFilteredItems([]);
        setSelectedGroup(groupId);
        handleGroupClick(groupId);
    };

    const deleteGroup = async (_id: any = null) => {
        try {
            const response = await fetch(`${apis.deleteGroupById}${_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const deletedId = await response.json();
                setFilteredItems((filteredItems: any) => filteredItems?.filter((group: any) => group._id !== deletedId.data));
                showMessage('Group has been deleted successfully.');
                return true;
            } else {
                showMessage('Group not deleted, Please try again.', 'error');
                return true;
            }
        } catch (error) {
            console.error('Error deleting contacts:', error);
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

    const handleGroupClick = async (groupId: any) => {
        try {
            const response = await fetch(apis.getMembersForGroup, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ groupId: groupId }),
            });
            if (response.ok) {
                const memberArr = await response.json();
                setMembers(memberArr);
                setFilteredItems(memberArr);
            } else {
                showMessage('Members not Found', 'error');
            }
        } catch (err) {
            showMessage('Error fetching members', 'error');
        }
    };

    /* CLIENTS APIS */
    const editUser = (_id: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (_id) {
            const user = filteredItems.find((u: any) => u._id === _id);
            setParams(user);
        }
        setAddContactModal(true);
    };

    const addUser = async () => {
        setNewAdd(true);
        try {
            const response = await fetch(apis.getAllClient, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(params),
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
            setContacts(data.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const viewUser = (_id: any = null) => {
        const user = filteredItems.find((u: any) => u._id === _id);
        setCurrentUser(user);
        setViewUserModal(true);
    };

    const deleteUser = async (_id: any = null) => {
        try {
            const response = await fetch(`${apis.deleteClientById}${_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const deletedId = await response.json();
                setFilteredItems(filteredItems.filter((d: any) => d._id !== deletedId.data));
                setMembers((filteredItems: any) => filteredItems.filter((contact: any) => contact._id !== deletedId.data));
                showMessage('User has been deleted successfully.');
                return true;
            } else {
                showMessage('User not deleted, Please try again.', 'error');
                return true;
            }
        } catch (error) {
            console.error('Error deleting contacts:', error);
        }
    };

    const exportContacts = async (selectedGroup: any) => {
        const response = await fetch(`${apis.exportContacts}?groupId=${selectedGroup}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to export contacts');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'clients.csv');
        document.body.appendChild(link);

        link.click();
        if (link.parentNode) {
            link.parentNode.removeChild(link);
        }
        showMessage(`Contacts of ${selectedGroup} exported Successfully!`);
    };

    // Function to import contacts
    const importContacts = (selectedGroup: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';

        input.onchange = async (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch(`${apis.importContacts}?groupId=${selectedGroup}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    if (!response.ok) {
                        showMessage('Failed to import contacts', 'error');
                        throw new Error('Failed to import contacts');
                    }

                    const result = await response.json();

                    if (result.changes?.length > 0) {
                        const invalidEntries = result.changes.filter((item: any) => item.action === 'invalid');
                        if (invalidEntries.length > 0) {
                            setInvalidEntries(invalidEntries);
                            setIsInvalidModalOpen(true);
                        } else {
                            if (result.data?.length > 0) {
                                const uniqueItems = [
                                    ...filteredItems,
                                    ...result.data.filter(
                                        (newItem: any) => !filteredItems.some((existingItem: any) => existingItem._id === newItem._id)
                                    ),
                                ];
                                setFilteredItems(uniqueItems);
                            }
                            showMessage(result.message);
                        }
                    } else {
                        if (result.data?.length > 0) {
                            const uniqueItems = [
                                ...filteredItems,
                                ...result.data.filter(
                                    (newItem: any) => !filteredItems.some((existingItem: any) => existingItem._id === newItem._id)
                                ),
                            ];
                            setFilteredItems(uniqueItems);
                        }
                        showMessage(result.message);
                    }
                } catch (error) {
                    showMessage('Failed to import contacts. Please try again.', 'error');
                }
            }
        };
        input.click();
    };

    const handleSaveInvalidNumbers = async () => {
        const csvData = invalidEntries.map(entry => {
            const { Name, Company_Name, Mobile_Number, Whatsapp_Number, Email, Address, City, District, Group_ID, Is_Favorite, FacebookID, InstagramID } = entry.client;
            return [Name, Company_Name, Mobile_Number, Whatsapp_Number, Email, Address, City, District, Group_ID, Is_Favorite, FacebookID, InstagramID];
        });

        const headers = [
            "Name", "Company_Name", "Mobile_Number", "Whatsapp_Number", "Email", "Address",
            "City", "District", "Group_ID", "Is_Favorite", "FacebookID", "InstagramID"
        ];

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvFile = new File([csvBlob], "invalid_contacts.csv", { type: "text/csv" });
        setIsInvalidModalOpen(false);
        setInvalidEntries([]);
        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const response = await fetch(apis.importContacts, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                showMessage('Failed to re-import invalid entries', 'error');
                throw new Error('Failed to re-import invalid entries');
            }

            const result = await response.json();
            const newInvalidEntries = result.changes?.filter((item: any) => item.action === 'invalid');
            if (newInvalidEntries?.length > 0) {
                setInvalidEntries(newInvalidEntries);
                setIsInvalidModalOpen(true);
            } else {
                if (result.data?.length > 0) {
                    const uniqueItems = [
                        ...filteredItems,
                        ...result.data.filter((newItem: any) => !filteredItems.some((existingItem: any) => existingItem._id === newItem._id)),
                    ];
                    setFilteredItems(uniqueItems);
                }
                showMessage(result.message);
                setIsInvalidModalOpen(false);
                setInvalidEntries([]);
            }
        } catch (error) {
            showMessage('Failed to re-import invalid entries. Please try again.', 'error');
        }
    };

    const closeInvalidModal = () => {
        setIsInvalidModalOpen(false);
    };

    const deleteContacts = async () => {
        try {
            const response = await fetch(apis.deleteClients, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: selectedRecords.map(contact => contact._id) }),
            });

            const deletedIds = await response.json();
            if (response.ok) {
                const updatedFilteredItems = filteredItems.filter((contact: any) => !deletedIds.includes(contact._id));
                setFilteredItems(updatedFilteredItems);
                setMembers(updatedFilteredItems);
                setSelectedRecords([]);
                showMessage("Contacts Deleted")
            } else {
                showMessage("Failed to Delete Contacts", 'error')
            }
        } catch (error) {
            showMessage("Failed to Delete Contacts : ", 'error')
        }
    };

    const validateEmail = (email: any) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobileNumber = (number?: string): boolean => {
        if (!number || typeof number !== "string") {
            showMessage(`Invalid number: ${number}`, 'error');
            return false;
        }

        const mobileRegexWithCountryCode = /^\+91\d{10}$/;
        const mobileRegexWithoutCountryCode = /^\d{10}$/;

        if (number.startsWith("+91")) {
            return mobileRegexWithCountryCode.test(number);
        } else {
            return mobileRegexWithoutCountryCode.test(number);
        }
    };


    const saveUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true);
        const newErrors: { [key: string]: string } = {};

        if (!params.name) {
            showMessage('Name is required.', 'error');
            setLoading(false);
            return true;
        }

        if (!params.whatsapp_number) {
            showMessage('Whatsapp Number is required.', 'error');
            setLoading(false);
            return true;
        }

        if (!validateEmail(params.email) && (params.email !== "" && params.email !== undefined)) {
            newErrors.email = 'Please enter a valid email address.';
            showMessage('Please enter a valid email address.', 'error');
            setLoading(false);
            return true;
        }

        if (!validateMobileNumber(params.whatsapp_number)) {
            newErrors.whatsapp_number = 'Whatsapp number must be exactly 10 digits excluding +91';
            showMessage('Whatsapp number must be exactly 10 digits excluding +91', 'error');
        }

        if ((params.mobile_number && !validateMobileNumber(params.mobile_number))) {
            newErrors.mobile_number = 'Mobile number must be exactly 10 digits excluding +91';
            showMessage('Mobile number must be exactly 10 digits excluding +91', 'error');
        }

        if (Object.keys(newErrors).length === 0) {
            try {
                if (params._id) {
                    const response = await fetch(`${apis.updateClientById}${params._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(params),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        let user = filteredItems.find((d: any) => d._id === params._id);
                        setFilteredItems((prevItems: any) => {
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
                        Object.assign(user, params);
                        showMessage('User has been updated successfully.');
                    } else {
                        showMessage(`Failed to update user: ${data.message}`, 'error');
                    }
                } else {
                    params.groupId = selectedGroup;
                    const formData = new FormData();
                    for (const key in params) {
                        if (params.hasOwnProperty(key)) {
                            formData.append(key, params[key]);
                        }
                    }
                    const response = await fetch(apis.createClient, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (response.ok) {
                        filteredItems.splice(0, 0, data.data);
                        showMessage('User has been added successfully.');
                    } else {
                        showMessage(`Failed to add user: ${data.message}`, 'error');
                    }
                }
            } catch (error) {
                showMessage(`Error: ${(error as Error).message}`, 'error');
            }
            setLoading(false);
            setAddContactModal(false);
        } else {
            setErrors(newErrors);
            setLoading(false);
            return true;
        }
        setLoading(false);
    };

    const handleProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target?.files?.[0];
        if (file) {
            setLoading(true);
            try {
                if (params._id) {
                    const whatsapp_number = String(params.whatsapp_number).trim().replace('+', '');
                    const formData = new FormData();
                    formData.append("profile_picture", file);
                    formData.append("_id", params._id);

                    const response = await fetch(`${apis.updateClientProfile}?whatsapp_number=${whatsapp_number}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        showMessage("Profile Picture Upload Failed, Please select again", 'error');
                    } else {
                        setFilteredItems((prevItems: any) => {
                            return prevItems.map((item: any) => {
                                if (item._id === params._id) {
                                    setParams(data.data);
                                    return {
                                        ...item,
                                        ...data.data,
                                    };
                                }
                                return item;
                            });
                        });
                        showMessage(data.message + " Please check contact in list");
                    }
                } else {
                    setParams({ ...params, profile_picture: file });
                }
            } catch (error) {
                showMessage('An error occurred while uploading. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            showMessage('No file selected. Please choose a file.', 'error');
        }
    };

    const handleCompanyProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target?.files?.[0];
        if (file) {
            setIsCompanyLoading(true);
            try {
                if (params._id) {
                    const whatsapp_number = String(params.whatsapp_number).trim().replace('+', '');

                    const formData = new FormData();
                    formData.append("company_profile_picture", file);
                    formData.append("_id", params._id);

                    const response = await fetch(`${apis.updateClientCompanyProfile}?whatsapp_number=${whatsapp_number}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        showMessage("Company Profile Picture Upload Failed, Please select again", 'error');
                    } else {
                        setFilteredItems((prevItems: any) => {
                            return prevItems.map((item: any) => {
                                if (item._id === params._id) {
                                    setParams(data.data);
                                    return {
                                        ...item,
                                        ...data.data,
                                    };
                                }
                                return item;
                            });
                        });
                        showMessage(data.message);
                    }
                } else {
                    setParams({ ...params, company_profile_picture: file });
                }
            } catch (error) {
                showMessage('An error occurred while uploading. Please try again.', 'error');
            } finally {
                setIsCompanyLoading(false);
            }
        } else {
            showMessage('No file selected. Please choose a file.', 'error');
        }
    }

    const toggleFavorite = async (_id: any) => {
        const filteredItem = filteredItems?.map((contact: any) =>
            contact._id === _id ? { ...contact, isFavorite: contact.isFavorite === "yes" ? "no" : "yes" } : contact
        );
        setFilteredItems(filteredItem);
        const updatedContact = filteredItems.find((contact: any) => contact._id === _id);
        try {
            const response = await fetch(`${apis.updateClientById}${_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isFavorite: updatedContact.isFavorite }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
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
            setSelectedRecords(filteredItems);
        } else {
            setSelectedRecords([]);
        }
    };
    const isAllSelected = selectedRecords.length === filteredItems.length && filteredItems.length > 0;

    const isButtonDisabled = !(
        invalidEntries[currentIndex]?.client.Whatsapp_Number?.length === 10 &&
        (!invalidEntries[currentIndex]?.client.Mobile_Number ||
            invalidEntries[currentIndex]?.client.Mobile_Number.length === 10)
    );

    const handleInputChange = (e: any, field: any) => {
        const newInvalidEntries = [...invalidEntries];
        const value = e.target.value;

        if (/^\d{0,10}$/.test(value)) {
            if (field === 'mobile') {
                newInvalidEntries[currentIndex].client.Mobile_Number = value;
                setErrorMessages((prev) => ({
                    ...prev,
                    mobile: value && value.length !== 10 ? 'Mobile Number must be 10 digits' : '',
                }));
            } else if (field === 'whatsapp') {
                newInvalidEntries[currentIndex].client.Whatsapp_Number = value;
                setErrorMessages((prev) => ({
                    ...prev,
                    whatsapp: value.length === 10 ? '' : 'WhatsApp Number must be 10 digits',
                }));
            }
            setInvalidEntries(newInvalidEntries);
        }
    };

    const handleRemoveProfileImage = async () => {
        try {
            const whatsapp_number = String(params.whatsapp_number).trim().replace('+', '');
            const formData = new FormData();
            formData.append("profile_picture", '');
            formData.append("_id", params._id);

            const response = await fetch(`${apis.updateClientProfile}?whatsapp_number=${whatsapp_number}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                showMessage("Profile Picture Upload Failed, Please select again", 'error');
            } else {
                setFilteredItems((prevItems: any) => {
                    return prevItems.map((item: any) => {
                        if (item._id === params._id) {
                            setParams(data.data);
                            return {
                                ...item,
                                ...data.data,
                            };
                        }
                        return item;
                    });
                });
                showMessage(data.message + " Please check contact in list");
            }
        } catch (error) {
            showMessage("Update Failed, Please try again.", 'error');
        }
    };

    const handleRemoveLogoImage = async () => {
        try {
            const whatsapp_number = String(params.whatsapp_number).trim().replace('+', '');

            const formData = new FormData();
            formData.append("company_profile_picture", '');
            formData.append("_id", params._id);

            const response = await fetch(`${apis.updateClientCompanyProfile}?whatsapp_number=${whatsapp_number}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                showMessage("Company Profile Picture Upload Failed, Please select again", 'error');
            } else {
                setFilteredItems((prevItems: any) => {
                    return prevItems.map((item: any) => {
                        if (item._id === params._id) {
                            setParams(data.data);
                            return {
                                ...item,
                                ...data.data,
                            };
                        }
                        return item;
                    });
                });
                showMessage(data.message);
            }
        } catch (error) {
            showMessage("Update Failed, Please try again.", 'error');
        }
    };

    const handleCheckboxChangeAdd = (contact: any) => {
        setSelectedContacts((prevSelected) => {
            if (prevSelected.includes(contact)) {
                return prevSelected.filter((item) => item !== contact);
            } else {
                return [...prevSelected, contact];
            }
        });
    };

    const handleAddToGroup = async () => {
        if (!selectedContacts.length || !selectedGroup) {
            showMessage("Please select contacts and a group.", "error");
            return;
        }

        const Ids = selectedContacts.map(contact => contact._id);
        const params = {
            Ids: Ids,
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
                const uniqueItems = [...filteredItems];

                data.data.forEach((newItem: any) => {
                    const index = uniqueItems.findIndex(item => item._id === newItem._id);
                    if (index !== -1) {
                        uniqueItems[index] = newItem;
                    } else {
                        uniqueItems.push(newItem);
                    }
                });
                setFilteredItems(uniqueItems);
                showMessage(data.message);
            } else {
                showMessage(`Failed to update user: ${data.message}`, 'error');
            }
        } catch (error: any) {
            showMessage(`An error occurred: ${error.message}`, 'error');
        } finally {
            setSelectedContacts([]);
            setNewAdd(false);
        }
    };

    const handleSelectAll = (isChecked: any) => {
        if (isChecked) {
            setSelectedContacts([...contacts]);
        } else {
            setSelectedContacts([]);
        }
    };

    const filteredContacts = contacts.filter((contact: any) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.whatsapp_number.includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredContacts.length / entriesPerPage);

    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );

    const isAllSelectedAdd = paginatedContacts.every((contact: any) =>
        selectedContacts.includes(contact)
    );

    /*OVER CLIENT */

    type RecordType = {
        profile_picture?: { url: string };
        company_profile_picture?: { url: string };
        name?: string;
        _id: string;
        isFavorite: string;
    };

    // const startIndex = (page - 1) * pageSize;
    // const endIndex = startIndex + pageSize;
    // const paginatedDetails = filteredItems.slice(startIndex, endIndex);

    return (
        <div>
            <div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-3 items-center">
                        {selectedGroup?.length > 0 ? (
                            <>
                                <button
                                    type="button"
                                    className="btn p-0 bg-transparent border-0"
                                    onClick={() => {
                                        setFilteredItems(null);
                                        setFilteredItems(groupList);
                                        setSelectedGroup(null);
                                    }}
                                >
                                    <IconArrowBackward className="text-primary" />
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                    <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                    Create Contact
                                </button>
                                <button type="button" className="btn btn-primary" onClick={() => addUser()}>
                                    <IconPlusCircle className="ltr:mr-2 rtl:ml-2" />
                                    Add Contact
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning gap-2"
                                    onClick={() => exportContacts(selectedGroup)}
                                >
                                    <IconSend />
                                    Export Contacts
                                </button>
                                <button
                                    className="btn btn-success gap-2"
                                    onClick={() => importContacts(selectedGroup)}
                                >
                                    <IconDownload />
                                    Import
                                </button>
                                {selectedRecords.length > 0 && (
                                    <button type="button" className="btn btn-danger gap-2" onClick={deleteContacts}>
                                        <IconTrashLines />
                                        Delete selected contacts ({selectedRecords.length})
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => editGroup()}
                            >
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Group
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {selectedGroup?.length > 0 ? (
                            <div className="relative sm:w-auto w-full max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="peer form-input py-2 ltr:pr-11 rtl:pl-11 w-full"
                                    value={searchClient}
                                    onChange={(e) => { searchContact(e); setSearchClient(e.target.value); }}
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
                                >
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative sm:w-auto w-full max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="peer form-input py-2 ltr:pr-11 rtl:pl-11 w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
                                >
                                    <IconSearch className="mx-auto" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <br />
                {filteredItems.length > 0 && (
                    <span className="flex items-center gap-4">
                        Total Items : ({filteredItems.length})
                    </span>
                )}
            </div>
            <br />
            <div className="datatables pagination-padding">
                {!selectedGroup ? (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={paginatedDetails}
                        columns={[
                            {
                                accessor: 'name',
                                sortable: true,
                            },
                            {
                                accessor: 'groupId',
                                sortable: true,
                            },
                            {
                                accessor: 'remarks',
                                sortable: true,
                            },
                            {
                                accessor: 'addedBy',
                                sortable: true,
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record: any) => {
                                    const { _id, groupId } = record;
                                    return (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button className="flex hover:text-info" onClick={() => editGroup(groupId)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>
                                            <button className="flex hover:text-primary" onClick={() => viewGroup(groupId)}>
                                                <IconEye />
                                            </button>
                                            <button type="button" className="flex hover:text-danger" onClick={() => deleteGroup(_id)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    );
                                },
                            },
                        ]}
                        highlightOnHover
                        totalRecords={filteredItems?.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedGroups}
                        onSelectedRecordsChange={setSelectedGroups}
                        paginationText={({ from, to, totalRecords }) =>
                            `Showing ${from} to ${to} of ${totalRecords} entries`
                        }
                    />
                ) : (
                    <div className="datatables pagination-padding">
                        <DataTable<RecordType>
                            className="table-hover whitespace-nowrap"
                            records={paginatedDetails}
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
                                    title: 'Logo',
                                    accessor: 'company_profile_picture',
                                    sortable: true,
                                    render: (record: { company_profile_picture?: { url: string } }) => (
                                        record.company_profile_picture?.url ? (
                                            <div className="flex items-center font-semibold">
                                                <div
                                                    className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2"
                                                    onClick={() => {
                                                        const url = record?.company_profile_picture?.url;
                                                        if (url) {
                                                            openModal(url);
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={record?.company_profile_picture?.url}
                                                        alt=""
                                                    />
                                                </div>
                                            </div>
                                        ) : null
                                    ),
                                },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    render: (record: { profile_picture?: { url: string }; name?: string }) => (
                                        <div className="flex items-center font-semibold">
                                            {record.profile_picture?.url && (
                                                <div
                                                    className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2"
                                                    onClick={() => openModal(record.profile_picture?.url || '')}
                                                >
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={record.profile_picture.url}
                                                        alt={record.name || 'Image'}
                                                    />
                                                </div>
                                            )}
                                            <div>{record.name || 'Unnamed'}</div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'email',
                                    sortable: true,
                                },
                                {
                                    accessor: 'groupName',
                                    sortable: true,
                                    render: (record: any) => {
                                        const { groupName } = record;
                                        if (!groupName) {
                                            return null;
                                        }
                                        const options = groupName.split(',').map((option: any) => option.trim());

                                        if (options.length > 1) {
                                            return (
                                                <select>
                                                    {options.map((option: any, index: any) => (
                                                        <option key={index} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            );
                                        } else {
                                            return <span>{options[0]}</span>;
                                        }
                                    },
                                },
                                {
                                    accessor: 'mobile_number',
                                    title: 'Mobile',
                                    sortable: true,
                                },
                                {
                                    accessor: 'whatsapp_number',
                                    title: 'Whatsapp',
                                    sortable: true,
                                },
                                {
                                    accessor: 'company_name',
                                    title: 'Company',
                                    sortable: true,
                                },
                                {
                                    accessor: 'city',
                                    sortable: true,
                                },
                                {
                                    accessor: 'action',
                                    title: 'Actions',
                                    sortable: false,
                                    textAlignment: 'center',
                                    render: (record: { _id: string; isFavorite: string }) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button onClick={() => toggleFavorite(record._id)} className="ml-2">
                                                {record.isFavorite === "yes" ? <FaStar className="text-yellow-500" /> : <FaRegStar />}
                                            </button>
                                            <button className="flex hover:text-info" onClick={() => editUser(record._id)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>
                                            <button className="flex hover:text-primary" onClick={() => viewUser(record._id)}>
                                                <IconEye />
                                            </button>
                                            <button type="button" className="flex hover:text-danger" onClick={(e) => deleteUser(record._id)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={filteredItems?.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            sortStatus={sortStatus}
                            onSortStatusChange={(status) => {
                                setSortStatus(status);
                            }}
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                        />
                    </div>
                )}
            </div>

            <Transition appear show={addGroupModal} as={Fragment}>
                <Dialog as="div" open={addGroupModal} onClose={() => setAddGroupModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
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
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddGroupModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {params.id ? 'Edit Contact' : 'Add Contact'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            {/* Name */}
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
                                                <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Remarks */}
                                            <div className="mb-5">
                                                <label htmlFor="remarks">Remarks</label>
                                                <input id="remarks" type="text" placeholder="Enter remarks" className="form-input" value={params.remarks} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddGroupModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveGroup}>
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
                                                        params._id ? 'Update' : 'Add'
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

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal}
                    onClose={() => {
                        setAddContactModal(false); setErrors('');
                    }}
                    className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
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
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddContactModal(false); setErrors(''); setLoading(false);
                                        }}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {params._id ? 'Edit Contact' : 'Add Contact'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            {/* Name */}
                                            <div className="mb-5">
                                                <label htmlFor="name">Name <span style={{ color: 'red' }}>*</span> </label>
                                                <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Business Name */}
                                            <div className="mb-5">
                                                <label htmlFor="company_name">Business Name</label>
                                                <input id="company_name" type="text" placeholder="Enter Business Name" className="form-input" value={params.company_name} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Email */}
                                            <div className="mb-5">
                                                <label htmlFor="email">Email</label>
                                                <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                                {errors.email && <div className="error">{errors.email}</div>}
                                            </div>

                                            {/* WhatsApp Number */}
                                            <div className="mb-5">
                                                <label
                                                    htmlFor="whatsapp_number"
                                                    className="block font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    WhatsApp Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="whatsapp_number"
                                                    type="text"
                                                    placeholder="Enter WhatsApp Number (e.g., 1234567890 or +911234567890)"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.whatsapp_number}
                                                    onChange={(e) => changeValue(e)}
                                                    maxLength={13}
                                                    pattern="(\+91\d{10}|\d{10})"
                                                    title="Enter 10 digits or a number in the format +91xxxxxxxxxx"
                                                />
                                                {errors.whatsapp_number && (
                                                    <div className="text-red-500 mt-2 text-sm">{errors.whatsapp_number}</div>
                                                )}
                                            </div>


                                            {/* Phone Number */}
                                            <div className="mb-5">
                                                <label
                                                    htmlFor="mobile_number"
                                                    className="block font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Mobile Number
                                                </label>
                                                <input
                                                    id="mobile_number"
                                                    type="text"
                                                    placeholder="Enter Mobile Number (e.g., 1234567890 or +911234567890)"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.mobile_number}
                                                    onChange={(e) => changeValue(e)}
                                                    maxLength={13}
                                                    pattern="(\+91\d{10}|\d{10})"
                                                    title="Enter 10 digits or a number in the format +91xxxxxxxxxx"
                                                />
                                                {errors.mobile_number && (
                                                    <div className="text-red-500 mt-2 text-sm">{errors.mobile_number}</div>
                                                )}
                                            </div>

                                            {/* Other Fields (Instagram, Facebook, etc.) */}
                                            <div className="mb-5">
                                                <label htmlFor="website" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Website
                                                </label>
                                                <input
                                                    id="website"
                                                    type="text"
                                                    placeholder="Enter Website"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.website}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mb-5">
                                                <label htmlFor="city" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    City
                                                </label>
                                                <input
                                                    id="city"
                                                    type="text"
                                                    placeholder="Enter City"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.city}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="district" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    District
                                                </label>
                                                <input
                                                    id="district"
                                                    type="text"
                                                    placeholder="Enter District"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.district}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="address" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Address
                                                </label>
                                                <input
                                                    id="address"
                                                    type="text"
                                                    placeholder="Enter Address"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.address}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            {/* Instagram ID */}
                                            <div className="mb-5">
                                                <label htmlFor="instagramID">Instagram ID</label>
                                                <input id="instagramID" type="text" placeholder="Enter Instagram ID" className="form-input" value={params.instagramID} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Facebook ID */}
                                            <div className="mb-5">
                                                <label htmlFor="facebookID">Facebook ID</label>
                                                <input id="facebookID" type="text" placeholder="Enter Facebook ID" className="form-input" value={params.facebookID} onChange={(e) => changeValue(e)} />
                                            </div>

                                            <div className="mb-5">
                                                <label htmlFor="profile_picture" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Profile Picture
                                                </label>
                                                {!params.profile_picture && (
                                                    <input
                                                        id="profile_picture"
                                                        accept="image/*"
                                                        type="file"
                                                        className={`form-input file:rounded-md file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 hover:file:bg-primary-dark ${loading ? "opacity-50 cursor-not-allowed" : ""
                                                            }`}
                                                        onChange={(event) => handleProfilePicture(event)}
                                                        disabled={loading}
                                                    />
                                                )}
                                                {params.profile_picture && (
                                                    <div className="mt-2 flex items-center">
                                                        <p className="text-sm text-gray-600">
                                                            Selected Image: {params.profile_picture.name ? params.profile_picture.name : params.profile_picture.filename}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                            onClick={handleRemoveProfileImage}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-5">
                                                <label htmlFor="company_profile_picture" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Logo
                                                </label>
                                                {!params.company_profile_picture && (
                                                    <input
                                                        id="company_profile_picture"
                                                        accept="image/*"
                                                        type="file"
                                                        className={`form-input file:rounded-md file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 hover:file:bg-primary-dark ${isCompanyLoading ? "opacity-50 cursor-not-allowed" : ""
                                                            }`}
                                                        onChange={(e) => handleCompanyProfilePicture(e)}
                                                        disabled={isCompanyLoading}
                                                    />
                                                )}
                                                {params.company_profile_picture && (
                                                    <>
                                                        <div className="mt-2 flex items-center">
                                                            <p className="mt-2 text-sm text-gray-600">Selected Image: {params.company_profile_picture.name ? params.company_profile_picture.name : params.company_profile_picture.filename}</p>
                                                            <button
                                                                type="button"
                                                                className="ml-2 text-red-500 hover:text-red-700"
                                                                onClick={handleRemoveLogoImage}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => {
                                                        setAddContactModal(false);
                                                        setErrors('');
                                                        setLoading(false);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                                    disabled={loading}
                                                    onClick={saveUser}>
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
                                                        params._id ? 'Update' : 'Add'
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

            <Transition appear show={newAdd} as={Fragment}>
                <Dialog
                    as="div"
                    open={newAdd}
                    onClose={() => setNewAdd(false)}
                    className="relative z-50"
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex items-center justify-center px-2 py-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white">
                                <div className="relative flex items-center justify-between bg-gray-100 dark:bg-gray-900 py-2 px-3">
                                    <h2 className="text-base font-semibold">Add Contacts</h2>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewAdd(false);
                                            setLoading(false);
                                        }}
                                        className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-3">
                                    {/* Filters Section */}
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <div>
                                            Show{" "}
                                            <select
                                                value={entriesPerPage}
                                                onChange={(e) => {
                                                    setEntriesPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="border rounded px-1 py-1"
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                            </select>{" "}
                                            entries
                                        </div>
                                        <div>Page {currentPage} of {totalPages}</div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            placeholder="Search Contacts..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full border rounded px-2 py-1 text-sm"
                                        />
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-auto max-h-[300px]">
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="border border-gray-300 px-2 py-1 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="cursor-pointer"
                                                            checked={isAllSelectedAdd}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                        />
                                                    </th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">Name</th>
                                                    <th className="border border-gray-300 px-2 py-1 text-left">WhatsApp Number</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedContacts.map((contact: any) => (
                                                    <tr key={contact._id} className="hover:bg-gray-100">
                                                        <td className="border border-gray-300 px-2 py-1 text-center">
                                                            <input
                                                                type="checkbox"
                                                                className="cursor-pointer"
                                                                checked={selectedContacts.includes(contact)}
                                                                onChange={() => handleCheckboxChangeAdd(contact)}
                                                            />
                                                        </td>
                                                        <td className="border border-gray-300 px-2 py-1">{contact.name}</td>
                                                        <td className="border border-gray-300 px-2 py-1">{contact.whatsapp_number}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination and Selected Count */}
                                    <div className="flex justify-between items-center mt-2 text-sm">
                                        <div>Selected Contacts: <span className="font-bold">{selectedContacts.length}</span></div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>

                                    {/* Add to Group Button */}
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={handleAddToGroup}
                                            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                            disabled={selectedContacts.length === 0}
                                        >
                                            Add to Group
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={viewUserModal} as={Fragment}>
                <Dialog as="div" open={viewUserModal} onClose={() => setViewUserModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
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
                                <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setViewUserModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        View Contact
                                    </div>
                                    <div className="p-5">
                                        {currentUser && (
                                            <div>
                                                {currentUser?.profile_picture?.url && (
                                                    <div className="p-5 flex justify-center items-center flex-col">
                                                        <img
                                                            src={`${currentUser.profile_picture.url}`}
                                                            className="h-32 w-32 rounded-full object-cover shadow-lg"
                                                            alt="Profile Picture"
                                                        />
                                                    </div>
                                                )}

                                                {/* User Name */}
                                                <div className="text-center">
                                                    {currentUser.name && (
                                                        <strong className="text-lg font-semibold">{currentUser.name}</strong>
                                                    )}
                                                </div>
                                                <br />
                                                {currentUser.company_name && (
                                                    <div className="mb-5">
                                                        <strong>Business Name:</strong> {currentUser.company_name}
                                                    </div>
                                                )}
                                                {currentUser.email && (
                                                    <div className="mb-5">
                                                        <strong>Email:</strong> {currentUser.email}
                                                    </div>
                                                )}
                                                {currentUser.whatsapp_number && (
                                                    <div className="mb-5">
                                                        <strong>WhatsApp Number:</strong> {currentUser.whatsapp_number}
                                                    </div>
                                                )}
                                                {currentUser.mobile_number && (
                                                    <div className="mb-5">
                                                        <strong>Phone Number:</strong> {currentUser.mobile_number}
                                                    </div>
                                                )}
                                                {currentUser.groupID && (
                                                    <div className="mb-5">
                                                        <strong>Group ID:</strong> {currentUser.groupID}
                                                    </div>
                                                )}
                                                {currentUser.groupName && (
                                                    <div className="mb-5">
                                                        <strong>Group Name:</strong> {currentUser.groupName}
                                                    </div>
                                                )}
                                                {currentUser.instagramID && (
                                                    <div className="mb-5">
                                                        <strong>Instagram ID:</strong> {currentUser.instagramID}
                                                    </div>
                                                )}
                                                {currentUser.facebookID && (
                                                    <div className="mb-5">
                                                        <strong>Facebook ID:</strong> {currentUser.facebookID}
                                                    </div>
                                                )}

                                                {currentUser?.company_profile_picture?.url && (
                                                    <div className="p-5 flex justify-center items-center flex-col">
                                                        <img
                                                            src={`${currentUser?.company_profile_picture?.url}`}
                                                            className="h-32 w-32 object-cover shadow-lg"
                                                            alt="Profile Picture"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-primary" onClick={() => setViewUserModal(false)}>
                                                Close
                                            </button>
                                        </div>
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

            {isInvalidModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative bg-white p-4 rounded">
                        <h2 className="text-xl mb-4">Invalid Entries</h2>

                        <div className="mb-4">
                            <div className="mb-2">
                                <strong>Name : {invalidEntries[currentIndex]?.client.Name}</strong>
                                <br />
                                <strong>Correction :</strong> <p>{invalidEntries[currentIndex]?.reason}</p>
                            </div>
                            <div className="flex flex-col mb-2">
                                <label className="font-semibold">Mobile Number:</label>
                                <input
                                    type="text"
                                    value={invalidEntries[currentIndex ? currentIndex : 0]?.client.Mobile_Number}
                                    onChange={(e) => handleInputChange(e, 'mobile')}
                                    pattern="\d*"
                                    maxLength={10}
                                    className="border p-2"
                                />
                                {errorMessages.mobile && (
                                    <span className="text-red-500 text-sm">{errorMessages.mobile}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold">WhatsApp Number:</label>
                                <input
                                    type="text"
                                    value={invalidEntries[currentIndex ? currentIndex : 0]?.client.Whatsapp_Number}
                                    onChange={(e) => handleInputChange(e, 'whatsapp')}
                                    pattern="\d*"
                                    maxLength={10}
                                    className="border p-2"
                                />
                                {errorMessages.whatsapp && (
                                    <span className="text-red-500 text-sm">{errorMessages.whatsapp}</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={closeInvalidModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const newIndex = currentIndex + 1;
                                    if (newIndex < invalidEntries.length) {
                                        setCurrentIndex(newIndex);
                                    } else {
                                        handleSaveInvalidNumbers();
                                        setIsInvalidModalOpen(false);
                                    }
                                }}
                                className={`bg-blue-500 text-white px-4 py-2 rounded ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isButtonDisabled}
                            >
                                {currentIndex < invalidEntries.length - 1 ? 'Next' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentsAppsGroups;
