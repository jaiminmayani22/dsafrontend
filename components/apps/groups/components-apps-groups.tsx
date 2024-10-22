'use client';

//LIBRARIES
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { sortBy } from 'lodash';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

//COMPONENETS
import IconSearch from '@/components/icon/icon-search';
import IconUser from '@/components/icon/icon-user';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconSend from '@/components/icon/icon-send';
import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import Dropdown from '@/components/dropdown';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconRefresh from '@/components/icon/icon-refresh';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import { IRootState } from '@/store';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Transition, Dialog } from '@headlessui/react';
import { Button } from '@mantine/core';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';

//FILES
import apis from '../../../public/apis';

const PAGE_SIZES = [10, 20, 50];
const token = localStorage.getItem('authToken');

const ComponentsAppsGroups = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedGroups, setSelectedGroups] = useState<any>(null);

    const [groupList, setGroups] = useState<any>([]);
    const [addGroupModal, setAddGroupModal] = useState<any>(false);
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [viewUserModal, setViewUserModal] = useState<any>(false);
    const [inputValue, setInputValue] = useState<any>('');
    const [selectedMembers, setSelectedMembers] = useState<any>('');
    const [viewGroupModal, setViewGroupModal] = useState<any>(false);
    const [page, setPage] = useState<any>(1); // Current page
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]); // Records per page
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });
    const [selectedOptions, setSelectedOptions] = useState<any>([]);
    const [errors, setErrors] = useState<any>({});
    const [groupNames, setGroupNames] = useState<any>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

    const [defaultParams] = useState<any>({
        _id: null,
        name: '',
        groupId: '',
        remarks: '',
        addedBy: '',
        createdAt: '',
        updatedAt: '',
    });

    const [defaultParamsMembers] = useState<any>({
        _id: null,
        name: '',
        company_name: '',
        mobile_number: '',
        whatsapp_number: '',
        email: '',
        city: '',
        profile_picture: '',
        company_profile_picture: '',
        remarks: '',
        instagramID: '',
        facebookID: '',
        groupID: '',
        groupName: '',
        isFavorite: '',
        addedBy: '',
        createdAt: '',
        updatedAt: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [members, setMembers] = useState<any>([]);
    const [memberParams, setMemberParams] = useState<any>(JSON.parse(JSON.stringify(defaultParamsMembers)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const changeMemberValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...members, [id]: value });
    };

    const [filteredItems, setFilteredItems] = useState<any>(groupList);
    const [search, setSearch] = useState<any>('');
    const searchContact = () => {
        setFilteredItems(() => {
            return groupList?.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
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
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setGroups(data);
                setFilteredItems(data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, []);

    //get all  members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(apis.getMembersForGroup, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
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
                console.error('Error fetching groups:', error);
            }
        };

        fetchMembers();
    }, []);

    //serach groups
    useEffect(() => {
        if (Array.isArray(groupList)) {
            setFilteredItems(groupList?.filter((item) =>
                item.name?.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, groupList]);

    //set page size
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    //page data set
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setFilteredItems([...groupList.slice(from, to)]);
    }, [page, pageSize, groupList]);

    //sorting
    useEffect(() => {
        const data2 = sortBy(filteredItems, sortStatus.columnAccessor);
        setFilteredItems(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

    const saveGroup = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        try {
            if (params._id) {
                //update user
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
                    let group = filteredItems.find((d: any) => d.id === params._id);
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
        const group = filteredItems.find((u: any) => u.groupId === groupId);
        setFilteredItems([]);
        setSelectedGroup(groupId);
        handleGroupClick(groupId);
        setViewGroupModal(true);
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
                setFilteredItems(filteredItems.filter((d: any) => d._id !== deletedId));
                setMembers((filteredItems: any) => filteredItems.filter((contact: any) => contact._id !== deletedId));
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

        input.onchange = async (event: any) => {
            const file = event.target?.files[0];
            if (file) {
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
                        showMessage('Failed to import contacts', 'error')
                        throw new Error('Failed to import contacts');
                    }

                    const result = await response.json();
                    setFilteredItems([...result.data]);
                    showMessage('Import successful');
                } catch (error) {
                    console.error('Error importing contacts:', error);
                    alert('Failed to import contacts. Please try again.');
                }
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
                setMembers((filteredItems: any) => filteredItems.filter((contact: any) => !deletedIds.includes(contact._id)));
                setSelectedRecords([]);
            } else {
                console.error('Failed to delete contacts:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting contacts:', error);
        }
    };

    const validateEmail = (email: any) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateMobileNumber = (number: any) => {
        const mobileRegex = /^\d{10}$/;
        return mobileRegex.test(number);
    };

    const saveUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }

        if (!params.whatsapp_number) {
            showMessage('Whatsapp Number is required.', 'error');
            return true;
        }

        if (!validateEmail(params.email) && (params.email !== "" && params.email !== undefined)) {
            newErrors.email = 'Please enter a valid email address.';
            showMessage('Please enter a valid email address.', 'error');
            return true;
        }

        if (!validateMobileNumber(params.whatsapp_number)) {
            newErrors.whatsapp_number = 'Whatsapp number must be exactly 10 digits.';
            showMessage('Mobile number must be exactly 10 digits.', 'error');
        }

        if ((!validateMobileNumber(params.mobile_number)) && (params.mobile_number !== "")) {
            newErrors.mobile_number = 'Mobile number must be exactly 10 digits.';
            showMessage('Mobile number must be exactly 10 digits.', 'error');
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
            setAddContactModal(false);
        } else {
            setErrors(newErrors);
            return true;
        }
    };

    const handleProfilePicture = (event: any) => {
        const file = event.target?.files[0];
        if (file) {
            setParams({ ...params, profile_picture: file });
        }
    };

    const handleCompanyProfilePicture = (e: any) => {
        const file = e.target?.files[0];
        if (file) {
            setParams({ ...params, company_profile_picture: file });
        }
    };

    const viewFavouriteContacts = () => {
        const favouriteContacts = filteredItems.filter((contact: any) => contact.isFavorite === 'yes');
        setFilteredItems(favouriteContacts);
    };

    const viewAll = () => {
        setFilteredItems(members);
    };

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

    /*OVER CLIENT */
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left Side: Action Buttons */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div>
                        {selectedGroup?.length > 0 ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={() => {
                                        setFilteredItems(groupList);
                                        setSelectedGroup(null);
                                    }}
                                >
                                    <IconArrowBackward className="ltr:mr-2 rtl:ml-2" />
                                    Go to All Groups
                                </button>
                                <br />
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex gap-3 flex-wrap items-center">
                                        <div>
                                            <button type="button" className="btn btn-primary" onClick={() => editUser()}>
                                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                                Add Contact
                                            </button>
                                        </div>
                                        <button type="button" className="btn btn-warning gap-2" onClick={() => exportContacts(selectedGroup)} >
                                            <IconSend />
                                            Export Contacts
                                        </button>
                                        <div className="dropdown">
                                            <Dropdown
                                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                btnClassName="btn btn-success gap-2 dropdown-toggle"
                                                button={
                                                    <>
                                                        <IconDownload />
                                                        Import Contacts
                                                        <span>
                                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                                        </span>
                                                    </>
                                                }
                                            >
                                                <ul className="!min-w-[170px]">
                                                    <li>
                                                        <button type="button" onClick={() => importContacts(selectedGroup)}>Import Contacts</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                        {selectedRecords.length > 0 && (
                                            <button type="button" className="btn btn-danger gap-2" onClick={deleteContacts}>
                                                <IconTrashLines />
                                                Delete selected contacts ({selectedRecords.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <div className="dropdown">
                                            <Dropdown
                                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                btnClassName="btn p-0 rounded-none border-0 shadow-none dropdown-toggle"
                                                button={<IconHorizontalDots className="h-6 w-6 opacity-70" />}
                                            >
                                                <ul className="!min-w-[170px]">
                                                    <li>
                                                        <button type="button" onClick={viewFavouriteContacts}>View Favourite Contacts</button>
                                                    </li>
                                                    <li>
                                                        <button type="button" onClick={viewAll}>View All Contacts</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
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
                </div>

                {/* Right Side: Search and Additional Dropdown */}
                <div className="flex items-center gap-2 ml-auto">
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
                </div>
            </div>

            <br />
            <div className="datatables pagination-padding">
                {!selectedGroup ? (
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={filteredItems}
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
                                accessor: 'createdAt',
                                sortable: true,
                                render: (record: any) => {
                                    const { createdAt } = record as any;
                                    return (
                                        <div className="text-gray-700 dark:text-gray-300">
                                            {new Date(createdAt).toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'updatedAt',
                                sortable: true,
                                render: ({ updatedAt }) => (
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {new Date(updatedAt).toLocaleString(undefined, {
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
                                render: ({ _id, groupId }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <button className="flex hover:text-info" onClick={() => editGroup(groupId)}>
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </button>
                                        <button className="flex hover:text-primary" onClick={() => viewGroup(groupId)}>
                                            <IconEye />
                                        </button>
                                        <button type="button" className="flex hover:text-danger" onClick={(e) => deleteGroup(_id)}>
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
                        <DataTable
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
                                    accessor: 'company_profile_picture',
                                    sortable: true,
                                    render: (record) => {
                                        const { _id, company_profile_picture } = record as { _id: any; company_profile_picture: { url?: string } };
                                        return company_profile_picture?.url ? (
                                            <div className="flex items-center font-semibold">
                                                <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(company_profile_picture.url)}>
                                                    <img className="h-8 w-8 rounded-full object-cover" src={company_profile_picture.url} alt="" />
                                                </div>
                                            </div>
                                        ) : null;
                                    },
                                },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    render: (record) => {
                                        const { profile_picture, name } = record as { profile_picture: { url?: string }, name: any };
                                        return profile_picture?.url ? (
                                            <div className="flex items-center font-semibold">
                                                <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(profile_picture?.url)}>
                                                    <img className="h-8 w-8 rounded-full object-cover" src={profile_picture?.url} alt="" />
                                                </div>
                                                <div>{name}</div>
                                            </div>
                                        ) : <div>{name}</div>;
                                    },
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
                                    sortable: true,
                                },
                                {
                                    accessor: 'whatsapp_number',
                                    sortable: true,
                                },
                                {
                                    accessor: 'company_name',
                                    sortable: true,
                                },
                                {
                                    accessor: 'createdAt',
                                    sortable: true,
                                    render: ({ createdAt }) => (
                                        <div className="text-gray-700 dark:text-gray-300">
                                            {new Date(createdAt).toLocaleString(undefined, {
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
                                    render: ({ updatedAt }) => (
                                        <div className="text-gray-700 dark:text-gray-300">
                                            {new Date(updatedAt).toLocaleString(undefined, {
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
                                    render: ({ isFavorite, _id }) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <button onClick={() => toggleFavorite(_id)} className="ml-2">
                                                {isFavorite === "yes" ? <FaStar className="text-yellow-500" /> : <FaRegStar />}
                                            </button>
                                            <button className="flex hover:text-info" onClick={() => editUser(_id)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>
                                            <button className="flex hover:text-primary" onClick={() => viewUser(_id)}>
                                                <IconEye />
                                            </button>
                                            <button type="button" className="flex hover:text-danger" onClick={(e) => deleteUser(_id)}>
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
                            recordsPerPageOptions={[10, 20, 30]}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
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
                                                    {params._id ? 'Update' : 'Add'}
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
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-50">
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
                                        onClick={() => setAddContactModal(false)}
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
                                                <label htmlFor="whatsapp_number">Whatsapp Number <span style={{ color: 'red' }}>*</span> </label>
                                                <input id="whatsapp_number" type="text" placeholder="Enter Whatsapp Number without country code" className="form-input" value={params.whatsapp_number} onChange={(e) => changeValue(e)} maxLength={10} pattern="\d{10}" />
                                                {errors.whatsapp_number && <div className="error" style={{ color: 'red' }}>{errors.whatsapp_number}</div>}
                                            </div>

                                            {/* Phone Number */}
                                            <div className="mb-5">
                                                <label htmlFor="phone">Phone Number </label>
                                                <input id="mobile_number" type="text" placeholder="Enter Phone Number without country code" className="form-input" value={params.mobile_number} onChange={(e) => changeValue(e)} maxLength={10} pattern="\d{10}" />
                                                {errors.mobile_number && <div className="error" style={{ color: 'red' }}>{errors.mobile_number}</div>}
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

                                            <div>
                                                <label htmlFor="profile_picture">Profile Picture</label>
                                                <input
                                                    id="profile_picture"
                                                    accept="image/*"
                                                    type="file"
                                                    className="rtl:file-ml-5 form-input p-0 file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-primary ltr:file:mr-5"
                                                    onChange={(event) => handleProfilePicture(event)}
                                                />
                                            </div>
                                            <br />
                                            <div>
                                                <label htmlFor="company_profile_picture">Company Profile Picture</label>
                                                <input
                                                    id="company_profile_picture"
                                                    accept="image/*"
                                                    type="file"
                                                    className="rtl:file-ml-5 form-input p-0 file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-primary ltr:file:mr-5"
                                                    onChange={(e) => handleCompanyProfilePicture(e)}
                                                />
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params._id ? 'Update' : 'Add'}
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
        </div>
    );
};

export default ComponentsAppsGroups;
