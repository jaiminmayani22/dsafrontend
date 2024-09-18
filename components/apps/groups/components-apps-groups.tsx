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

import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import Link from 'next/link';
import { IRootState } from '@/store';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Transition, Dialog } from '@headlessui/react';
import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';

const ComponentsAppsGroups = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [groupName, setGroupName] = useState(['Option 1', 'Option 2', 'Option 3']);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [viewUserModal, setViewUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);


    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        id: null,
        name: '',
        email: '',
        groupName: '',
        phone: '',
        businessName: '',
        createdOn: '',
        lastSeen: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const [search, setSearch] = useState<any>('');
    const [contactList] = useState<any>([
        {
            id: 1,
            path: 'profile-35.png',
            name: 'Alan Green',
            role: 'Web Developer',
            email: 'alan@mail.com',
            location: 'Boston, USA',
            phone: '+1 202 555 0197',
            groupName: 'Developers',
            businessName: 'GreenTech Solutions',
            createdOn: '2023-01-01',
            lastSeen: '2023-09-12',
            posts: 25,
            followers: '5K',
            following: 500,
        },
        {
            id: 2,
            path: 'profile-35.png',
            name: 'Linda Nelson',
            role: 'Web Designer',
            email: 'linda@mail.com',
            location: 'Sydney, Australia',
            phone: '+1 202 555 0170',
            groupName: 'Designers',
            businessName: 'Nelson Design Co.',
            createdOn: '2022-06-15',
            lastSeen: '2023-09-13',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 3,
            path: 'profile-35.png',
            name: 'Lila Perry',
            role: 'UX/UI Designer',
            email: 'lila@mail.com',
            location: 'Miami, USA',
            phone: '+1 202 555 0105',
            groupName: 'Designers',
            businessName: 'Perry Designs',
            createdOn: '2023-02-20',
            lastSeen: '2023-09-11',
            posts: 20,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 4,
            path: 'profile-35.png',
            name: 'Andy King',
            role: 'Project Lead',
            email: 'andy@mail.com',
            location: 'Tokyo, Japan',
            phone: '+1 202 555 0194',
            groupName: 'Leaders',
            businessName: 'King Enterprises',
            createdOn: '2022-09-05',
            lastSeen: '2023-09-14',
            posts: 25,
            followers: '21.5K',
            following: 300,
        },
        {
            id: 5,
            path: 'profile-35.png',
            name: 'Jesse Cory',
            role: 'Web Developer',
            email: 'jesse@mail.com',
            location: 'Edinburgh, UK',
            phone: '+1 202 555 0161',
            groupName: 'Developers',
            businessName: 'Cory Tech',
            createdOn: '2021-11-23',
            lastSeen: '2023-09-10',
            posts: 30,
            followers: '20K',
            following: 350,
        },
        {
            id: 6,
            path: 'profile-35.png',
            name: 'Xavier',
            role: 'UX/UI Designer',
            email: 'xavier@mail.com',
            location: 'New York, USA',
            phone: '+1 202 555 0155',
            groupName: 'Designers',
            businessName: 'Xavier Studios',
            createdOn: '2022-04-18',
            lastSeen: '2023-09-09',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 7,
            path: 'profile-35.png',
            name: 'Susan',
            role: 'Project Manager',
            email: 'susan@mail.com',
            location: 'Miami, USA',
            phone: '+1 202 555 0118',
            groupName: 'Managers',
            businessName: 'Susan Management Inc.',
            createdOn: '2021-03-10',
            lastSeen: '2023-09-14',
            posts: 40,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 8,
            path: 'profile-35.png',
            name: 'Raci Lopez',
            role: 'Web Developer',
            email: 'traci@mail.com',
            location: 'Edinburgh, UK',
            phone: '+1 202 555 0135',
            groupName: 'Developers',
            businessName: 'Lopez Web Services',
            createdOn: '2020-08-25',
            lastSeen: '2023-09-08',
            posts: 25,
            followers: '21.5K',
            following: 350,
        },
        {
            id: 9,
            path: 'profile-35.png',
            name: 'Steven Mendoza',
            role: 'HR',
            email: 'sokol@verizon.net',
            location: 'Monrovia, US',
            phone: '+1 202 555 0100',
            groupName: 'HR Team',
            businessName: 'Mendoza Staffing',
            createdOn: '2019-05-15',
            lastSeen: '2023-09-13',
            posts: 40,
            followers: '21.8K',
            following: 300,
        },
        {
            id: 10,
            path: 'profile-35.png',
            name: 'James Cantrell',
            role: 'Web Developer',
            email: 'sravani@comcast.net',
            location: 'Michigan, US',
            phone: '+1 202 555 0134',
            groupName: 'Developers',
            businessName: 'Cantrell Coding',
            createdOn: '2020-02-29',
            lastSeen: '2023-09-07',
            posts: 100,
            followers: '28K',
            following: 520,
        },
        {
            id: 11,
            path: 'profile-35.png',
            name: 'Reginald Brown',
            role: 'Web Designer',
            email: 'drhyde@gmail.com',
            location: 'Entrimo, Spain',
            phone: '+1 202 555 0153',
            groupName: 'Designers',
            businessName: 'Brown Web Design',
            createdOn: '2021-07-11',
            lastSeen: '2023-09-12',
            posts: 35,
            followers: '25K',
            following: 500,
        },
        {
            id: 12,
            path: 'profile-35.png',
            name: 'Stacey Smith',
            role: 'Chief Technology Officer',
            email: 'maikelnai@optonline.net',
            location: 'Lublin, Poland',
            phone: '+1 202 555 0115',
            groupName: 'Executives',
            businessName: 'Smith Technologies',
            createdOn: '2018-12-15',
            lastSeen: '2023-09-06',
            posts: 21,
            followers: '5K',
            following: 200,
        },
    ]);


    const [filteredItems, setFilteredItems] = useState<any>(contactList);

    const searchContact = () => {
        setFilteredItems(() => {
            return contactList.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    };

    useEffect(() => {
        searchContact();
    }, [search]);

    const saveUser = () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.email) {
            showMessage('Email is required.', 'error');
            return true;
        }
        if (!params.groupName) {
            showMessage('Group name is required.', 'error');
            return true;
        }
        if (!params.phone) {
            showMessage('Phone is required.', 'error');
            return true;
        }
        if (!params.businessName) {
            showMessage('Business name is required.', 'error');
            return true;
        }
        if (!params.createdOn) {
            showMessage('created date is required.', 'error');
            return true;
        }
        if (!params.lastSeen) {
            showMessage('last seen is required.', 'error');
            return true;
        }

        if (params.id) {
            //update user
            let user: any = filteredItems.find((d: any) => d.id === params.id);
            user.name = params.name;
            user.email = params.email;
            user.groupName = params.groupName;
            user.phone = params.phone;
            user.businessName = params.businessName;
            user.createdOn = params.createdOn;
            user.lastSeen = params.lastSeen;
        } else {
            //add user
            let maxUserId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

            let user = {
                id: maxUserId + 1,
                path: 'profile-35.png',
                name: params.name,
                email: params.email,
                groupName: params.groupName,
                phone: params.phone,
                businessName: params.businessName,
                createdOn: params.createdOn,
                lastSeen: params.lastSeen,
                posts: 20,
                followers: '5K',
                following: 500,
            };
            filteredItems.splice(0, 0, user);
            //   searchContacts();
        }

        showMessage('User has been saved successfully.');
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

    const handleSelectContact = (contactId) => {
        if (selectedContacts.includes(contactId)) {
            setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
        } else {
            setSelectedContacts([...selectedContacts, contactId]);
        }
    };

    // Select all contacts
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allContactIds = filteredItems.map((contact) => contact.id);
            setSelectedContacts(allContactIds);
        } else {
            setSelectedContacts([]);
        }
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

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sortedContacts = [...filteredItems].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setFilteredItems(sortedContacts);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return '↕'; // Neutral icon
    };

    const handleDropdownChange = (e) => {
        changeValue({ ...params, selectedGroup: e.target.value });
    };

    const handleAddGroup = () => {
        console.log("Add group:", params.groupName);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            changeValue({ ...params, profilePicture: file });
        }
    };

    const handleAddOption = () => {
        if (inputValue && !groupName.includes(inputValue)) {
            setGroupName([...groupName, inputValue]);
            setSelectedOption(inputValue);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const refreshContacts = () => {
        // Logic to refresh the contact list
        // For example, reset filters, re-fetch data, etc.
        // setFilteredItems([...contacts]); // Assuming `contacts` is your original list
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

            {value === 'list' && (
                <div className="panel mt-5 overflow-hidden border-0 p-0">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            checked={filteredItems.length > 0 && selectedContacts.length === filteredItems.length}
                                        />
                                    </th>
                                    <th onClick={() => handleSort('name')} className="cursor-pointer">
                                        Name {getSortIcon('name')}
                                    </th>
                                    <th onClick={() => handleSort('email')} className="cursor-pointer">
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th onClick={() => handleSort('groupName')} className="cursor-pointer">
                                        Group Name {getSortIcon('groupName')}
                                    </th>
                                    <th onClick={() => handleSort('phone')} className="cursor-pointer">
                                        Whatsapp Number {getSortIcon('phone')}
                                    </th>
                                    <th onClick={() => handleSort('businessName')} className="cursor-pointer">
                                        Business Name {getSortIcon('businessName')}
                                    </th>
                                    <th onClick={() => handleSort('createdOn')} className="cursor-pointer">
                                        Created On {getSortIcon('createdOn')}
                                    </th>
                                    <th onClick={() => handleSort('lastSeen')} className="cursor-pointer">
                                        Last Seen {getSortIcon('lastSeen')}
                                    </th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleSelectContact(contact.id)}
                                                    checked={selectedContacts.includes(contact.id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="flex w-max items-center">
                                                    {contact.path && (
                                                        <div className="w-max">
                                                            <img src={`/assets/images/${contact.path}`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                        </div>
                                                    )}
                                                    {!contact.path && contact.name && (
                                                        <div className="grid h-8 w-8 place-content-center rounded-full bg-primary text-sm font-semibold text-white ltr:mr-2 rtl:ml-2"></div>
                                                    )}
                                                    {!contact.path && !contact.name && (
                                                        <div className="rounded-full border border-gray-300 p-2 ltr:mr-2 rtl:ml-2 dark:border-gray-800">
                                                            <IconUser className="h-4.5 w-4.5" />
                                                        </div>
                                                    )}
                                                    <div>{contact.name}</div>
                                                </div>
                                            </td>
                                            <td>{contact.email}</td>
                                            <td className="whitespace-nowrap">{contact.groupName}</td>
                                            <td className="whitespace-nowrap">{contact.phone}</td>
                                            <td className="whitespace-nowrap">{contact.businessName}</td>
                                            <td className="whitespace-nowrap">{contact.createdOn}</td>
                                            <td className="whitespace-nowrap">{contact.lastSeen}</td>
                                            <td>
                                                <div className="mx-auto flex w-max items-center gap-4">
                                                    <button className="flex hover:text-info" onClick={() => editUser(contact)}>
                                                        <IconEdit className="h-4.5 w-4.5" />
                                                    </button>
                                                    <button className="flex hover:text-primary" onClick={() => viewUser(contact)}>
                                                        <IconEye />
                                                    </button>
                                                    <button type="button" className="flex hover:text-danger" onClick={(e) => deleteUser(contact)}>
                                                        <IconTrashLines />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                                <label htmlFor="businessName">Business Name</label>
                                                <input id="businessName" type="text" placeholder="Enter Business Name" className="form-input" value={params.businessName} onChange={(e) => changeValue(e)} />
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
                                                <input id="phone" type="text" placeholder="Enter Phone Number" className="form-input" value={params.phone} onChange={(e) => changeValue(e)} />
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
                                                    {/* Dropdown Menu */}
                                                    <select
                                                        id="groupName"
                                                        className="form-select"
                                                        value={selectedOption}
                                                        onChange={handleDropdownChange}
                                                    >
                                                        <option value="">Select Group</option>
                                                        {groupName.map((option, index) => (
                                                            <option key={index} value={option}>{option}</option>
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
                                                    onChange={(e) => handleFileChange(e)}

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
                                                    <strong>Business Name:</strong> {currentUser.businessName}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Email:</strong> {currentUser.email}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>WhatsApp Number:</strong> {currentUser.whatsappNumber}
                                                </div>
                                                <div className="mb-5">
                                                    <strong>Phone Number:</strong> {currentUser.phone}
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

export default ComponentsAppsGroups;
