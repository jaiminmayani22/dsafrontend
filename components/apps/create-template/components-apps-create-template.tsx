'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';
import IconCopy from '@/components/icon/icon-copy';

const ComponentsAppsCreateTemplate = () => {
    const token = localStorage.getItem('authToken');
    const [items, setItems] = useState<any>([]);

    const [page, setPage] = useState<any>(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState<any>(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [records, setRecords] = useState<any>([]);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [isModalOpen, setIsModalOpen] = useState<any>(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const [search, setSearch] = useState<any>('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'firstName',
        direction: 'asc',
    });

    //DUMMY SET

    // const [image, setImage] = useState(null);
    // const [username, setUsername] = useState('');
    // const [profilePicUrl, setProfilePicUrl] = useState('');
    // const [preview, setPreview] = useState(null);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // // Prepare FormData
    //     // const formData = new FormData();
    //     // // formData.append('template', image); // Use 'template' field for the image file
    //     // formData.append('videoPath', "http://localhost:8080/./public/videoplayback.mp4"); // Use 'template' field for the image file
    //     // formData.append('username', "Jaimin");
    //     // formData.append('logoPath', "http://localhost:8080/./public/profile_picture/6666666666.jpg");

    //     let formData = {
    //         videoPath: "http://localhost:8080/./public/videoplayback.mp4", // Use 'template' field for the image file
    //         username: "Jaimin",
    //         logoPath: "http://localhost:8080/./public/profile_picture/testImage.png",
    //     };

    //     try {
    //         const res = await fetch('http://localhost:8080/template/processVideo', {  //FOR VIDEO
    //         // const res = await fetch('http://localhost:8080/template/testAPI', {  //FOR IMAGE
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',  // Set content-type to application/json
    //             },
    //             body: JSON.stringify(formData),
    //         });

    //         if (res.ok) {
    //             //FOR IMAGE
    //             const blob = await res.blob();
    //             // setPreview(URL.createObjectURL(blob));

    //             //FOR VIDEO
    //             const videoURL = URL.createObjectURL(blob);
    //             setPreview(videoURL);
    //         } else {
    //             console.error('Error processing image');
    //         }
    //     } catch (error) {
    //         console.error('Error submitting form:', error);
    //     }
    // };

    //DUMMY SET OVER

    useEffect(() => {
        const fetchAllTemplates = async () => {
            try {
                const response = await fetch(apis.getAllTemplates, {
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
                setItems(data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchAllTemplates();
    }, []);

    useEffect(() => {
        if (items && Array.isArray(items)) {
            setInitialRecords(items);
        }
    }, [items]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;

        if (Array.isArray(initialRecords)) {
            setRecords([...initialRecords.slice(from, to)]);
        }
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter((item: any) => {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase())
                    // item.email.toLowerCase().includes(search.toLowerCase()) ||
                    // item.date.toLowerCase().includes(search.toLowerCase()) ||
                    // item.amount.toLowerCase().includes(search.toLowerCase()) ||
                    // item.status.tooltip.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

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
                    setRecords(updatedItems);
                    setInitialRecords(updatedItems);
                    setItems(updatedItems);
                    setSelectedRecords([]);
                    setSearch('');
                } else {
                    let selectedRows = selectedRecords || [];
                    const ids = selectedRows.map((d: any) => d._id);
                    await Promise.all(ids.map((_id: any) => deleteTemplateAPI(_id)));
                    const result = items.filter((d: any) => !ids.includes(d._id as never));
                    setRecords(result);
                    setInitialRecords(result);
                    setItems(result);
                    setSelectedRecords([]);
                    setSearch('');
                    setPage(1);
                }
                showMessage('Template deleted successfully');
            } catch (error) {
                console.error('Error deleting template:', error);
                showMessage('An error occurred while deleting the template.', 'error');
            }
        }
    };

    const deleteTemplateAPI = async (_id: any) => {
        const response = await fetch(apis.deleteTemplate, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ _id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.message || 'Failed to delete the template.');
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

    return (
        <div>
            <div>
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                            <IconTrashLines />
                            Delete
                        </button>
                        <Link href="/apps/create-template/create-new" className="btn btn-primary gap-2">
                            <IconPlus />
                            Create Template
                        </Link>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={records}
                        columns={[
                            {
                                accessor: 'template',
                                sortable: true,
                                render: (record) => {
                                    const { template } = record as { template: any }; // Cast record to the expected type
                                    return template?.url ? (
                                        <div className="flex items-center font-semibold">
                                            <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2" onClick={() => openModal(template?.url)}>
                                                <img className="h-8 w-8 rounded-full object-cover" src={template.url} alt="" />
                                            </div>
                                        </div>
                                    ) : null;
                                }

                            },
                            {
                                accessor: 'name',
                                sortable: true,
                            },
                            {
                                accessor: 'createdAt',
                                sortable: true,
                                render: (record) => {
                                    const { createdAt } = record as { createdAt: string };
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
                                            {formattedDate} at {formattedTime}
                                        </div>
                                    );
                                },
                            },
                            {
                                accessor: 'isApproved',
                                sortable: true,
                                render: (record) => {
                                    const { isApproved } = record as { isApproved: string }; // Cast record to the expected type
                                    return (
                                        <button
                                            className={`btn ${isApproved === 'yes' ? 'btn-success' : 'btn-danger'}`}
                                        >
                                            {isApproved === 'yes' ? 'Approved' : 'Not Approved'}
                                        </button>
                                    );
                                },
                            },
                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (record) => {
                                    const { _id } = record as { _id: string }; 
                                    return (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                                <IconCopy className="h-4.5 w-4.5" />
                                            </Link>
                                            <Link href="/apps/create-template/create-new" className="flex hover:text-info">
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </Link>
                                            <Link href="/apps/invoice/preview" className="flex hover:text-primary">
                                                <IconEye />
                                            </Link>
                                            <button
                                                type="button"
                                                className="flex hover:text-danger"
                                                onClick={() => deleteRow(_id)}
                                            >
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    );
                                },
                            },
                        ]}
                        highlightOnHover
                        totalRecords={initialRecords?.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        selectedRecords={selectedRecords}
                        onSelectedRecordsChange={setSelectedRecords}
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
        </div>

        // TEST PART
        // <div>
        //     <h1>Send Personalized Image</h1>
        //     <form onSubmit={handleSubmit}>
        //         <div>
        //             <label>Upload Image:</label>
        //             <input
        //                 type="file"
        //                 accept="image/*"
        //                 onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
        //             />
        //         </div>
        //         <div>
        //             <label>Username:</label>
        //             <input
        //                 type="text"
        //                 value={username}
        //                 onChange={(e) => setUsername(e.target.value)}
        //             />
        //         </div>
        //         <div>
        //             <label>Profile Picture URL:</label>
        //             <input
        //                 type="text"
        //                 value={profilePicUrl}
        //                 onChange={(e) => setProfilePicUrl(e.target.value)}
        //             />
        //         </div>
        //         <button type="submit">Generate Image</button>
        //     </form>

        //     {/* {preview && (
        //         <div>
        //             <h2>Preview:</h2>
        //             <img src={preview} alt="Generated" />
        //         </div>
        //     )} */}
        //     {preview && (
        //         <video controls width="600" src={preview}>
        //             Your browser does not support the video tag.
        //         </video>
        //     )}
        // </div>
        //TEST PART OVER
    );
};

export default ComponentsAppsCreateTemplate;
