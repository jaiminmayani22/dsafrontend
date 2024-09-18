'use client';
import IconFacebook from '@/components/icon/icon-facebook';
import IconInstagram from '@/components/icon/icon-instagram';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconSearch from '@/components/icon/icon-search';
import IconTwitter from '@/components/icon/icon-twitter';
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
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { FaStar, FaRegStar } from 'react-icons/fa';

import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import Link from 'next/link';
import { IRootState } from '@/store';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Transition, Dialog } from '@headlessui/react';
import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';

const PAGE_SIZES = [10, 20, 50];
const token = localStorage.getItem('authToken');

const ComponentsAppsContacts = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [contactList, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [viewUserModal, setViewUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(1); // Current page
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]); // Records per page
    const [sortStatus, setSortStatus] = useState({ accessor: 'name', direction: 'asc' }); // Sorting state
    const [groupNames, setGroupNames] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const [defaultParams] = useState({
        id: null,
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

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const [filteredItems, setFilteredItems] = useState<any>(contactList);
    const [search, setSearch] = useState<any>('');
    const searchContact = () => {
        setFilteredItems(() => {
            return contactList.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch(apis.getAllClient, {
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
                setContacts(data.data);
                setFilteredItems(data.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    useEffect(() => {
        if (Array.isArray(contactList)) {
            setFilteredItems(contactList.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            ));
        }
    }, [search, contactList]);

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
                setGroupNames(data);
                console.log("Group Data : ", groupNames);
                
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
        };

        fetchGroupNames();
    }, []);

    const saveUser = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.mobile_number) {
            showMessage('Phone is required.', 'error');
            return true;
        }

        try {
            if (params.id) {
                //update user
                const response = await fetch(`${apis.updateClientById}${params.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });

                const data = await response.json();

                if (response.ok) {
                    let user = filteredItems.find((d) => d.id === params.id);
                    Object.assign(user, params);
                    showMessage('User has been updated successfully.');
                } else {
                    showMessage(`Failed to update user: ${data.message}`, 'error');
                }
            } else {
                // Add user
                const response = await fetch(apis.createClient, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(params),
                });

                const data = await response.json();

                if (response.ok) {
                    let user = {
                        ...params,
                    };
                    filteredItems.splice(0, 0, user);
                    showMessage('User has been added successfully.');
                } else {
                    showMessage(`Failed to add user: ${data.message}`, 'error');
                }
            }
        } catch (error) {
            showMessage(`Error: ${error.message}`, 'error');
        }
        setAddContactModal(false);
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
        }
        setAddContactModal(true);
    };

    const viewUser = (user: any = null) => {
        setCurrentUser(user);
        setViewUserModal(true);
    };

    const exportContacts = async () => {
        // console.log("Export contacts clicked");

        // const response = await fetch(apis.exportContacts, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) {
        //     throw new Error('Failed to export contacts');
        // }

        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(new Blob([blob]));

        // const link = document.createElement('a');
        // link.href = url;
        // link.setAttribute('download', 'clients.xlsx');
        // document.body.appendChild(link);

        // link.click();
        // link.parentNode.removeChild(link);

        console.log('Contacts exported successfully');
    };

    // Function to import contacts
    const importContacts = () => {
        // const input = document.createElement('input');
        // input.type = 'file';
        // input.accept = '.csv';

        // input.onchange = (event) => {
        //     const file = event.target.files[0];
        //     const reader = new FileReader();

        //     reader.onload = (e) => {
        //         const csvContent = e.target.result;
        //         const lines = csvContent.split('\n');
        //         const newContacts = lines.slice(1).map(line => {
        //             const [name, email] = line.split(',');
        //             return { name, email };
        //         });

        //         // setContacts([...contacts, ...newContacts]);
        //         console.log('Contacts imported:', newContacts);
        //     };

        //     reader.readAsText(file);
        // };

        // // Trigger file input
        // input.click();
    };

    // Function to delete selected contacts
    const deleteContacts = () => {
        if (selectedContacts.length === 0) {
            console.log('No contacts selected for deletion');
            return;
        }

        const remainingContacts = contacts.filter(contact => !selectedContacts.includes(contact.email));
        setContacts(remainingContacts);
        setSelectedContacts([]); // Clear the selection
        console.log('Selected contacts deleted');
    };

    const deleteUser = (user: any = null) => {
        setFilteredItems(filteredItems.filter((d: any) => d.id !== user.id));
        showMessage('User has been deleted successfully.');
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

    const handleDropdownChange = (e) => {
        const value = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );
        setSelectedOptions(value);
    };

    const handleProfilePicture = (e) => {
        const file = e.target.files[0];
        if (file) {
            changeValue({ ...params, profilePicture: file });
        }
    };

    const handleCompanyProfilePicture = (e) => {
        const file = e.target.files[0];
        if (file) {
            changeValue({ ...params, companyProfilePicture: file });
        }
    };

    const handleAddOption = async () => {
        if (inputValue && !groupNames.includes(inputValue)) {
            try {
                const response = await fetch(apis.createGroup, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: inputValue }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error fetching group names:', error);
            }
            setGroupNames([...groupNames, inputValue]);
            setSelectedOption(inputValue);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const refreshContacts = async () => {
        try {
            const response = await fetch(apis.getAllClientCount);
            const data = await response.json();

            if (response.ok) {
                setFilteredItems([...contacts]);
                // setContactCount(data.totalRecords);
            } else {
                console.error('Failed to fetch client count:', data.message);
            }
        } catch (error) {
            console.error('Error fetching client count:', error);
        }
    };

    const toggleFavorite = async (id) => {
        const filteredItems = contactList.map((contact) =>
            contact.id === id ? { ...contact, isFavorite: !contact.isFavorite } : contact
        );
        setContacts(filteredItems);

        const updatedContact = filteredItems.find(contact => contact.id === id);

        try {
            const response = await fetch(`${apis.updateClientById}${id}`, {
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

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 ml-auto">
                    {/* Displaying the count of filtered contacts */}
                    <span className="text-sm font-medium">
                        Showing {filteredItems.length} contacts
                    </span>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => refreshContacts()}
                    >
                        <IconRefresh className="ltr:mr-2 rtl:ml-2" />
                        Refresh
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
                    <button type="button" className="btn btn-warning gap-2" onClick={exportContacts}>
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
                                    <button type="button" onClick={importContacts}>Import Contacts</button>
                                </li>
                                <li>
                                    <button type="button" onClick={importContacts}>Import Group</button>
                                </li>
                                <li>
                                    <button type="button" onClick={importContacts}>Import Profile Images</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    {selectedContacts.length > 0 && (
                        <button type="button" className="btn btn-danger gap-2" onClick={deleteContacts}>
                            <IconTrashLines />
                            Delete selected contacts ({selectedContacts.length})
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
                    <div className="dropdown">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn p-0 rounded-none border-0 shadow-none dropdown-toggle"
                            button={<IconHorizontalDots className="h-6 w-6 opacity-70" />}
                        >
                            <ul className="!min-w-[170px]">
                                <li>
                                    <button type="button">Delete All</button>
                                </li>
                                <li>
                                    <button type="button">View Favourite Contacts</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>

                {/* Selected Contacts Count */}
                {selectedContacts.length > 0 && (
                    <div className="w-full text-sm text-gray-600">
                        {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                    </div>
                )}
            </div>

            <br />
            <div className="datatables pagination-padding">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={filteredItems}
                    columns={[
                        {
                            accessor: 'company_profile_picture',
                            sortable: true,
                            render: ({ id, company_profile_picture }) => (
                                <div className="flex items-center font-semibold">
                                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                                        <img className="h-8 w-8 rounded-full object-cover" src={company_profile_picture?.url} alt="" />
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'name',
                            sortable: true,
                            render: ({ name, profile_picture, id }) => (
                                <div className="flex items-center font-semibold">
                                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                                        <img className="h-8 w-8 rounded-full object-cover" src={profile_picture?.url} alt="" />
                                    </div>
                                    <div>{name}</div>
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
                        },
                        {
                            accessor: 'updatedAt',
                            sortable: true,
                        },
                        {
                            accessor: 'action',
                            title: 'Actions',
                            sortable: false,
                            textAlignment: 'center',
                            render: ({ isFavorite, id }) => (
                                <div className="mx-auto flex w-max items-center gap-4">
                                    <button onClick={() => toggleFavorite(id)} className="ml-2">
                                        {isFavorite ? <FaStar className="text-yellow-500" /> : <FaRegStar />}
                                    </button>
                                    <button className="flex hover:text-info" onClick={() => editUser(id)}>
                                        <IconEdit className="h-4.5 w-4.5" />
                                    </button>
                                    <button className="flex hover:text-primary" onClick={() => viewUser(id)}>
                                        <IconEye />
                                    </button>
                                    <button type="button" className="flex hover:text-danger" onClick={(e) => deleteUser(id)}>
                                        <IconTrashLines />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={contactList.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    selectedRecords={selectedContacts}
                    onSelectedRecordsChange={setSelectedContacts}
                    paginationText={({ from, to, totalRecords }) =>
                        `Showing ${from} to ${to} of ${totalRecords} entries`
                    }
                />
            </div>

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
                                        {params.id ? 'Edit Contact' : 'Add Contact'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            {/* Name */}
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
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
                                            </div>

                                            {/* WhatsApp Number */}
                                            <div className="mb-5">
                                                <label htmlFor="whatsappNumber">Whatsapp Number</label>
                                                <input id="whatsappNumber" type="text" placeholder="Enter Whatsapp Number" className="form-input" value={params.whatsappNumber} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Phone Number */}
                                            <div className="mb-5">
                                                <label htmlFor="phone">Phone Number</label>
                                                <input id="mobile_number" type="text" placeholder="Enter Phone Number" className="form-input" value={params.mobile_number} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Group ID */}
                                            <div className="mb-5">
                                                <label htmlFor="groupID">Group ID</label>
                                                <input id="groupID" type="text" placeholder="Enter Group ID" className="form-input" value={params.groupID} onChange={(e) => changeValue(e)} />
                                            </div>

                                            {/* Group Name */}
                                            <div className="mb-5">
                                                <label htmlFor="groupName">Select or Add Option</label>
                                                <div className="input-group">
                                                    {/* Multi-Select Dropdown Menu */}
                                                    <select
                                                        id="groupName"
                                                        className="form-select"
                                                        multiple
                                                        value={selectedOptions}
                                                        onChange={handleDropdownChange}
                                                    >
                                                        {groupNames.map((groupName, index) => (
                                                            <option key={index} value={groupName}>
                                                                {groupName}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Input Box */}
                                                    <input
                                                        id="groupName"
                                                        type="text"
                                                        placeholder="Enter or select Group Name"
                                                        className="form-input"
                                                        value={inputValue}
                                                        onChange={handleInputChange}
                                                    />

                                                    {/* Add Button */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary add-option-btn"
                                                        onClick={handleAddOption}
                                                    >
                                                        Add Group
                                                    </button>
                                                </div>
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
                                                <label htmlFor="ctnFile">Profile Picture</label>
                                                <input
                                                    id="profilePicture"
                                                    accept="image/*"
                                                    type="file"
                                                    className="rtl:file-ml-5 form-input p-0 file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-primary ltr:file:mr-5"
                                                    onChange={(e) => handleProfilePicture(e)}

                                                />
                                            </div>
                                            <br />
                                            <div>
                                                <label htmlFor="ctnFile">Company Profile Picture</label>
                                                <input
                                                    id="companyProfilePicture"
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
                                                    {params.id ? 'Update' : 'Add'}
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
                                                <div className="p-5 flex justify-center items-center flex-col">
                                                    {currentUser.path ? (
                                                        <img
                                                            src={`/assets/images/${currentUser.path}`}
                                                            className="h-32 w-32 rounded-full object-cover shadow-lg"
                                                            alt="Profile Picture"
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                            No Profile Picture
                                                        </div>
                                                    )}
                                                </div>

                                                {/* User Name */}
                                                <div className="text-center">
                                                    <strong className="text-lg font-semibold">{currentUser.name}</strong>
                                                </div>
                                                <br />
                                                <div className="mb-5">
                                                    <strong>Business Name:</strong> {currentUser.company_name}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Email:</strong> {currentUser.email}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>WhatsApp Number:</strong> {currentUser.whatsapp_number}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Phone Number:</strong> {currentUser.mobile_number}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Group ID:</strong> {currentUser.groupID}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Group Name:</strong> {currentUser.groupName}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Instagram ID:</strong> {currentUser.instagramID}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Facebook ID:</strong> {currentUser.facebookID}
                                                </div>
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

        </div>
    );
};

export default ComponentsAppsContacts;
