'use client';

//LIBRARIES
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { sortBy } from 'lodash';
import Select, { MultiValue } from 'react-select';
import { IRootState } from '@/store';
import { Transition, Dialog } from '@headlessui/react';
import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'

//COMPONENTS
import IconSearch from '@/components/icon/icon-search';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconSend from '@/components/icon/icon-send';
import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import Dropdown from '@/components/dropdown';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconRefresh from '@/components/icon/icon-refresh';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconCaretDown from '@/components/icon/icon-caret-down';

//FILES
import apis from '../../../public/apis';
import router from 'next/router';

const ComponentsAppsContacts = () => {
    const router = useRouter();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }

    const PAGE_SIZES = [10, 20, 30, 50, 100];

    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [viewUserModal, setViewUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<Contact | undefined>(undefined);
    const [page, setPage] = useState(1); // Current page
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]); // Records per page
    const [totalRecords, setTotalRecords] = useState(10);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'createdAt',
        direction: 'desc',
    });
    const [groupNames, setGroupNames] = useState<Group[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const [isInvalidModalOpen, setIsInvalidModalOpen] = useState(false);
    const [errorMessages, setErrorMessages] = useState({ mobile: '', whatsapp: '' });
    const [loading, setLoading] = useState(false);
    const [exploading, setexpLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [isCompanyLoading, setIsCompanyLoading] = useState(false);

    const [defaultParams] = useState({
        _id: null,
        name: '',
        company_name: '',
        mobile_number: '',
        whatsapp_number: '',
        email: '',
        website: '',
        city: '',
        district: '',
        address: '',
        profile_picture: '',
        company_profile_picture: '',
        remarks: '',
        instagramID: '',
        facebookID: '',
        groupId: '',
        groupName: '',
        isFavorite: '',
        addedBy: '',
        createdAt: '',
        updatedAt: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    type Contact = {
        _id: string;
        name?: string;
        email?: string;
        website?: string;
        groupName?: string;
        groupId?: string;
        city?: string;
        district?: string;
        address?: string;
        mobile_number?: string;
        company_name?: string;
        whatsapp_number?: string;
        profile_picture?: any;
        company_profile_picture?: any;
        instagramID?: string;
        facebookID?: string;
        isFavorite?: string;
        addedBy?: string;
        isNumberOnWhatsapp?: string;
        createdAt?: any;
        updatedAt?: any;
    };

    interface Group {
        groupId: string;
        name: string;
    }

    const [contactList, setContacts] = useState<Contact[]>([]);
    const [filteredItems, setFilteredItems] = useState<any>([]);
    const [filterFavorite, setFiltereFavorite] = useState<any>(false);
    const [filterUnavailable, setFiltereUnavailable] = useState<any>(false);
    const [invalidEntries, setInvalidEntries] = useState<any[]>([]);
    const [search, setSearch] = useState<any>('');
    const [currentIndex, setCurrentIndex] = useState(0);

    //fetch contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch(apis.getAllClient, {
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
                            isFavorite: filterFavorite === true ? 'yes' : undefined,
                            isNumberOnWhatsapp: filterUnavailable === true ? 'no' : undefined,
                        },
                    }),
                });
                const data = await response.json();

                if (response.status === 401 && data.message === "Token expired! Please login again") {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    return;
                }

                if (!response.ok) {
                    showMessage(data.message, 'error');
                    return;
                }
                setTotalRecords(data.totalRecords);
                setContacts(data.data);
                setFilteredItems(data.data);
            } catch (error) {
                showMessage('Error fetching contacts', 'error');
            }
        };

        fetchContacts();
    }, [page, pageSize, sortStatus, search, filterFavorite, filterUnavailable]);

    useEffect(() => {
        if (search) {
            setPage(1);
        }
    }, [search]);

    //fetch group names
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
                    return;
                }
                setGroupNames(data);
            } catch (error) {
                showMessage('Error fetching group names', 'error');
            }
        };

        fetchGroupNames();
    }, []);

    //pagination
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    //sorting
    useEffect(() => {
        const data2 = sortBy(filteredItems, sortStatus.columnAccessor);
        setFilteredItems(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        // setPage(1);
    }, [sortStatus]);

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
                        let user = filteredItems.find((d: Contact) => d._id === params._id);
                        if (user) {
                            Object.assign(user, params);
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
                            showMessage('User has been updated successfully.');
                        } else {
                            showMessage('User not found.', 'error');
                        }
                    } else {
                        showMessage(`Failed to update user: ${data.message}`, 'error');
                    }
                } else {
                    const formData = new FormData();
                    for (const key in params) {
                        if (params.hasOwnProperty(key)) {
                            formData.append(key, params[key]);
                        }
                    }
                    const response = await fetch(`${apis.createClient}?whatsapp_number=${params.whatsapp_number}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });
                    const data = await response.json();

                    if (response.ok) {
                        setFilteredItems((prevItems: any) => [data.data, ...prevItems]);
                        showMessage('User has been added successfully.');
                    } else {
                        showMessage(`Failed to add user: ${data.message}`, 'error');
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    showMessage(`Error: ${error.message}`, 'error');
                } else {
                    showMessage('An unknown error occurred.', 'error');
                }
            } finally {
                setLoading(false);
            }
            setErrors('');
            setAddContactModal(false);
        } else {
            setErrors(newErrors);
            setLoading(false);
            return true;
        }
        setLoading(false);
    };

    const editUser = (_id: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (_id) {
            const user = filteredItems.find((u: any) => u._id === _id);
            setParams(user);
        }
        setAddContactModal(true);
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
                const updatedFilteredItems = filteredItems.filter((d: any) => d._id !== deletedId.data);
                setFilteredItems(updatedFilteredItems);
                setContacts(updatedFilteredItems);
                showMessage('User has been deleted successfully.');
                return true;
            } else {
                console.error('Failed to delete contacts:', response.statusText);
                showMessage('User not deleted, Please try again.', 'error');
                return true;
            }
        } catch (error) {
            console.error('Error deleting contacts:', error);
        }
    };

    const exportContacts = async () => {
        try {
            setexpLoading(true);

            const response = await fetch(apis.exportContacts, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
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
        } catch (error) {
            console.error(error);
            showMessage("Please try again", 'error')
        } finally {
            setexpLoading(false);
        }
    };

    const importContacts = () => {
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
                    const response = await fetch(apis.importContacts, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        showMessage(result.message, 'error');
                        return;
                    }

                    if (result.changes?.length > 0) {
                        const invalidEntries = result.changes.filter((item: any) => item.action === 'invalid');
                        if (invalidEntries.length > 0) {
                            setInvalidEntries(invalidEntries);
                            setIsInvalidModalOpen(true);
                        } else {
                            if (result.data?.length > 0) {
                                const newEntries = result.data.filter(
                                    (item: any) => !filteredItems.some((existingItem: any) => existingItem.id === item.id)
                                );
                                setFilteredItems((prev: any) => [...prev, ...newEntries]);
                            }
                            showMessage(result.message);
                        }
                    } else {
                        if (result.data?.length > 0) {
                            const newEntries = result.data.filter(
                                (item: any) => !filteredItems.some((existingItem: any) => existingItem.id === item.id)
                            );
                            setFilteredItems((prev: any) => [...prev, ...newEntries]);
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
                return;
            }

            const result = await response.json();

            const newInvalidEntries = result.changes?.filter((item: any) => item.action === 'invalid') || [];
            if (newInvalidEntries.length > 0) {
                setInvalidEntries(newInvalidEntries);
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

    const importProfileImages = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (event) => {
            const target = event.target as HTMLInputElement;
            const files = target.files;

            if (files && files.length > 0) {
                const formData = new FormData();
                Array.from(files).forEach((file) => {
                    formData.append('profile_picture', file);
                });

                try {
                    const response = await fetch(apis.multiProfilePics, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const result = await response.json();
                    if (!response.ok) {
                        showMessage(result.message);
                        return;
                    } else {
                        setFilteredItems((prevItems: any) => {
                            const updatedItemsMap = new Map(
                                result.results.map((item: any) => [String(item?.whatsapp_number).trim(), item])
                            );
                            return prevItems.map((item: any) => {
                                const normalizedWhatsApp = String(item?.whatsapp_number).trim();
                                const updatedItem = updatedItemsMap.get(normalizedWhatsApp);

                                return updatedItem ? { ...item, ...updatedItem } : item;
                            });
                        });
                        showMessage(result.message);
                    }
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        alert(`Failed to upload images: ${error.message}. Please try again.`);
                    } else {
                        alert('Failed to upload images. Please try again.');
                    }
                }
            } else {
                showMessage('Images not selected, please try again!', 'error');
            }
        };

        input.click();
    };

    const importCompanyProfileImages = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async (event) => {
            const target = event.target as HTMLInputElement | null;
            const files = target?.files;

            if (files && files.length > 0) {
                const formData = new FormData();
                Array.from(files).forEach((file) => {
                    formData.append('company_profile_picture', file);
                });
                try {
                    const response = await fetch(apis.multiCompanyProfilePics, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const result = await response.json();
                    if (!response.ok) {
                        showMessage(result.message);
                    } else {
                        setFilteredItems((prevItems: any) => {
                            const updatedItemsMap = new Map(
                                result.results.map((item: any) => [String(item?.whatsapp_number).trim(), item])
                            );
                            return prevItems.map((item: any) => {
                                const normalizedWhatsApp = String(item?.whatsapp_number).trim();
                                const updatedItem = updatedItemsMap.get(normalizedWhatsApp);

                                return updatedItem ? { ...item, ...updatedItem } : item;
                            });
                        });
                        showMessage("Company" + result.message);
                    }
                } catch (error) {
                    alert('Failed to upload images. Please try again.');
                }
            } else {
                showMessage('Images not selected, PLease try Again !', 'error');
            }
        };

        input.click();
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

            if (response.ok) {
                const deletedIds = await response.json();
                const updatedFilteredItems = filteredItems.filter((contact: any) => !deletedIds.includes(contact._id));
                setFilteredItems(updatedFilteredItems);
                setContacts(updatedFilteredItems);
                setSelectedRecords([]);
            } else {
                console.error('Failed to delete contacts:', response.statusText);
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
    };

    const refreshContacts = async () => {
        setRefreshLoading(true);
        try {
            const response = await fetch(apis.getAllClient, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                setTotalRecords(data.totalRecords);
                setSearch('');
            } else {
                console.error('Failed to fetch client count:', data.message);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        } finally {
            setRefreshLoading(false);
        }
    };

    const toggleFavorite = async (_id: string) => {
        if (!_id) {
            showMessage("Please try again",'error');
            return;
        }
        try {
            const response = await fetch(`${apis.updateClientById}${_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isFavorite: filteredItems.find((contact: any) => contact._id === _id)?.isFavorite === "yes" ? "no" : "yes" }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setFilteredItems((prevItems: any) => {
                return prevItems.map((item: any) => {
                    if (item._id === _id) {
                        return {
                            ...item,
                            ...data.data, // Ensure latest server response is merged
                        };
                    }
                    return item;
                });
            });
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobileNumber = (number: string): boolean => {
        const mobileRegexWithCountryCode = /^\+91\d{10}$/;
        const mobileRegexWithoutCountryCode = /^\d{10}$/;

        if (number.startsWith("+91")) {
            return mobileRegexWithCountryCode.test(number);
        } else {
            return mobileRegexWithoutCountryCode.test(number);
        }
    };

    const downloadCSV = () => {
        const link = document.createElement('a');
        link.href = `${window.location.origin}/template.csv`;
        link.download = 'template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const viewFavouriteContacts = () => {
        setFiltereFavorite(true);
        setFiltereUnavailable(false);
    };

    const viewUnavailableContacts = () => {
        setFiltereUnavailable(true);
        setFiltereFavorite(undefined);
    };

    const viewAll = () => {
        setFiltereFavorite(false);
        setFiltereUnavailable(false);
    };

    const openModal = (imageUrl: string) => {
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

    interface Option {
        value: string;
        label: string;
    }

    const handleGroupNameChange = (selectedOptions: MultiValue<Option>) => {
        const groupNamesString = selectedOptions.map(option => option.value).join(', ');
        setParams((prev: any) => ({
            ...prev,
            groupId: groupNamesString,
        }));
    };

    const selectedGroupIds = params.groupId ? params.groupId.split(', ') : [];

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

    const isButtonDisabled = !(
        invalidEntries[currentIndex]?.client.Whatsapp_Number?.length === 10 &&
        (!invalidEntries[currentIndex]?.client.Mobile_Number ||
            invalidEntries[currentIndex]?.client.Mobile_Number.length === 10)
    );

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

    type RecordType = {
        profile_picture?: { url: string };
        company_profile_picture?: { url: string };
        name?: string;
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 ml-auto">
                    {/* Displaying the count of filtered contacts */}
                    <span className="text-sm font-medium">
                        Total {totalRecords} contacts
                    </span>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={() => refreshContacts()}
                        disabled={refreshLoading}
                    >
                        <IconRefresh
                            className={`ltr:mr-2 rtl:ml-2 ${refreshLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>
            <br />
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left Side: Action Buttons */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div>
                        <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                            <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                            Add Contact
                        </button>
                    </div>
                    <button
                        type="button"
                        className="btn btn-warning gap-2"
                        onClick={exportContacts}
                        disabled={exploading}
                    >
                        {exploading ? (
                            <span>Exporting...</span>
                        ) : (
                            <>
                                <IconSend />
                                Export Contacts
                            </>
                        )}
                    </button>

                    <div className="dropdown">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-success gap-2 dropdown-toggle"
                            button={
                                <>
                                    <IconDownload />
                                    Import
                                    <span>
                                        <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[170px]">
                                <li>
                                    <button type="button" onClick={() => importContacts()}>Import Contacts</button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => importProfileImages()}>Profile Images</button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => importCompanyProfileImages()}>Logos</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    {selectedRecords.length > 0 && (
                        <button type="button" className="btn btn-danger gap-2" onClick={() => deleteContacts()}>
                            <IconTrashLines />
                            Delete selected contacts ({selectedRecords.length})
                        </button>
                    )}
                </div>

                {/* Right Side: Search and Additional Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                    <div className="relative sm:w-auto w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search Contacts"
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
                    <div className="relative">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn p-0 rounded-md border-0 shadow-none dropdown-toggle"
                            button={
                                <button className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition">
                                    <IconHorizontalDots className="h-6 w-6 opacity-70" />
                                </button>
                            }
                        >
                            <ul className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden w-56">
                                <li>
                                    <button
                                        type="button"
                                        onClick={viewFavouriteContacts}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                                    >
                                        ⭐ Favourites
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={viewUnavailableContacts}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                                    >
                                        🚫 Unavailable on WhatsApp
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={viewAll}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                                    >
                                        👀 View All
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={downloadCSV}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition whitespace-nowrap"
                                    >
                                        📥 Download CSV
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>

                {/* Selected Contacts Count */}
                {selectedRecords.length > 0 && (
                    <div className="w-full text-sm text-gray-600">
                        {selectedRecords.length} contact{selectedRecords.length > 1 ? 's' : ''} selected
                    </div>
                )}
            </div>

            <br />
            <div className="datatables pagination-padding">
                <DataTable<RecordType>
                    className="table-hover whitespace-nowrap"
                    records={filteredItems}
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
                            title: 'Group',
                            sortable: true,
                            render: (record) => {
                                const groupName = (record as { groupName?: string }).groupName;

                                if (!groupName) {
                                    return null;
                                }

                                const options = groupName.split(',').map((option) => option.trim());

                                if (options.length > 1) {
                                    return (
                                        <select>
                                            {options.map((option, index) => (
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
                            render: (record: any) => (
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
                                    <button type="button" className="flex hover:text-danger" onClick={() => deleteUser(record._id)}>
                                        <IconTrashLines />
                                    </button>
                                </div>
                            ),
                        }
                    ]}
                    highlightOnHover
                    totalRecords={totalRecords}
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

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-50">
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
                                    {/* Close button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddContactModal(false); setErrors(''); setLoading(false);
                                        }}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <IconX />
                                    </button>

                                    {/* Modal Header */}
                                    <div className="bg-gray-100 py-4 px-6 text-lg font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                        {params._id ? 'Edit Contact' : 'Add Contact'}
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6 space-y-6">
                                        <form>
                                            {/* Name */}
                                            <div className="mb-5">
                                                <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter Name"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.name}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            {/* Business Name */}
                                            <div className="mb-5">
                                                <label htmlFor="company_name" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Business Name
                                                </label>
                                                <input
                                                    id="company_name"
                                                    type="text"
                                                    placeholder="Enter Business Name"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.company_name}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="mb-5">
                                                <label htmlFor="email" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Email
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter Email"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.email}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                                {errors.email && <div className="text-red-500 mt-2 text-sm">{errors.email}</div>}
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

                                            {/* Group Select Dropdown */}
                                            <div className="mb-5">
                                                <label htmlFor="groupId" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Select Group
                                                </label>
                                                <Select
                                                    id="groupId"
                                                    placeholder="Select an option"
                                                    options={groupNames?.map((group) => ({
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

                                            <div className="mb-5">
                                                <label htmlFor="instagramID" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Instagram ID
                                                </label>
                                                <input
                                                    id="instagramID"
                                                    type="text"
                                                    placeholder="Enter Instagram ID"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.instagramID}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mb-5">
                                                <label htmlFor="facebookID" className="block font-medium text-gray-700 dark:text-gray-300">
                                                    Facebook ID
                                                </label>
                                                <input
                                                    id="facebookID"
                                                    type="text"
                                                    placeholder="Enter Facebook ID"
                                                    className="form-input mt-1 block w-full rounded-md border border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                                    value={params.facebookID}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mb-5">
                                                <label
                                                    htmlFor="isFavorite"
                                                    className="block font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Add as Favorite Contact
                                                </label>
                                                <div className="mt-1 flex items-center">
                                                    <label
                                                        htmlFor="isFavorite"
                                                        className="relative inline-flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            id="isFavorite"
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={(params.isFavorite === "yes") ? true : false}
                                                            onChange={(e) =>
                                                                changeValue({ target: { id: "isFavorite", value: e.target.checked ? "yes" : "no" } })
                                                            }
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-focus:ring-offset-gray-200 dark:peer-focus:ring-offset-gray-800"></div>
                                                        <div className="absolute w-5 h-5 bg-white rounded-full shadow left-1 top-0.5 peer-checked:translate-x-5 transition-transform"></div>
                                                    </label>
                                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {params.isFavorite ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Profile Picture Upload */}
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
                                            <div className="mt-8 flex justify-end space-x-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 dark:hover:bg-red-900"
                                                    onClick={() => {
                                                        setAddContactModal(false); setErrors(''); setLoading(false);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                    onClick={saveUser}
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

            <Transition appear show={viewUserModal} as={Fragment}>
                <Dialog as="div" open={viewUserModal} onClose={() => setViewUserModal(false)} className="relative z-50">
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
                                        onClick={() => setViewUserModal(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-gray-100 py-4 text-lg font-medium px-6 dark:bg-[#111827]">
                                        View Contact
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {currentUser && (
                                            <div>
                                                {currentUser?.profile_picture?.url && (
                                                    <div className="flex justify-center items-center flex-col">
                                                        <img
                                                            src={`${currentUser.profile_picture.url}`}
                                                            className="h-32 w-32 rounded-full object-cover shadow-lg border-4 border-gray-200 dark:border-gray-700"
                                                            alt="Profile Picture"
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-center mt-4">
                                                    {currentUser.name && (
                                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                                            {currentUser.name}
                                                        </h2>
                                                    )}
                                                </div>
                                                <br />
                                                {currentUser.company_name && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Business Name:</strong> {currentUser.company_name}
                                                    </div>
                                                )}
                                                {currentUser.email && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Email:</strong> {currentUser.email}
                                                    </div>
                                                )}
                                                {currentUser.whatsapp_number && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">WhatsApp Number:</strong> {currentUser.whatsapp_number}
                                                    </div>
                                                )}
                                                {currentUser.mobile_number && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Phone Number:</strong> {currentUser.mobile_number}
                                                    </div>
                                                )}
                                                {currentUser.groupId && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Group ID:</strong> {currentUser.groupId}
                                                    </div>
                                                )}
                                                {currentUser.groupName && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Group Name:</strong> {currentUser.groupName}
                                                    </div>
                                                )}
                                                {currentUser.instagramID && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Instagram ID:</strong> {currentUser.instagramID}
                                                    </div>
                                                )}
                                                {currentUser.facebookID && (
                                                    <div className="mb-5 text-gray-600 dark:text-gray-400">
                                                        <strong className="font-semibold text-gray-800 dark:text-gray-200">Facebook ID:</strong> {currentUser.facebookID}
                                                    </div>
                                                )}
                                                {currentUser?.company_profile_picture?.url && (
                                                    <div className="flex justify-center items-center flex-col">
                                                        <img
                                                            src={`${currentUser?.company_profile_picture?.url}`}
                                                            className="h-32 w-32 object-cover shadow-lg rounded-lg border-4 border-gray-200 dark:border-gray-700"
                                                            alt="Company Profile Picture"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-8 flex items-center justify-end space-x-4">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                                onClick={() => setViewUserModal(false)}
                                            >
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
                            onClick={() => closeModal()}
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

export default ComponentsAppsContacts;
