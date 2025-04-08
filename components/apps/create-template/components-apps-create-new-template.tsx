'use client';
//LIBRARIES
import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import domtoimage from 'dom-to-image';

//COMPONENTS
import IconSave from '@/components/icon/icon-save';
import IconTrashLines from '@/components/icon/icon-trash-lines';

//FILES
import '../../../styles/style.css';
import 'react-quill/dist/quill.snow.css';
import apis from '../../../public/apis';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconImage from '@/components/icon/icon-image';

const ComponentsAppsCreateNewTemplate = () => {
    const router = useRouter();

    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }

    const [height, setHeight] = useState<any>(1080);
    const [width, setWidth] = useState<any>(1080);
    const [dimensions, setDimensions] = useState<any>({ width: 1080, height: 1080 });

    const [variables, setAllVariables] = useState<any>([]);
    const [templateRefName, setTemplateRefName] = useState<any>('');
    const [isRefModalOpen, setIsRefModalOpen] = useState<any>(false);

    const canvasRef = useRef<any>(null);
    const [layers, setLayers] = useState<any>([]);
    const [isDragging, setIsDragging] = useState<any>(false);
    const [selectedLayer, setSelectedLayer] = useState<any>(null);
    const [selectedVariable, setSelectedVariable] = useState<any>('');
    const [loading, setLoading] = useState(false);
    const [isCustomDimensions, setIsCustomDimensions] = useState(false);
    const [footerWidth, setFooterWidth] = useState(100);
    const [footerHeight, setFooterHeight] = useState(24);
    const [selectedCellId, setSelectedCellId] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const scalingFactor = 450 / Math.max(width, height);

    const fileInputRef = useRef<any>(null);
    const [isUploading, setIsUploading] = useState<any>(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState("");

    useEffect(() => {
        const fetchAllVariables = async () => {
            try {
                const response = await fetch(apis.getAllVariables, {
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
                setAllVariables(data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchAllVariables();
    }, []);

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

    const handleHeightChange = (e: any) => {
        const value = e.target.value;
        setHeight(parseInt(value, 10));
        setIsCustomDimensions(true);
    };

    const handleWidthChange = (e: any) => {
        const value = e.target.value;
        setWidth(parseInt(value, 10));
        setIsCustomDimensions(true);
    };

    const handlePresetChange = (presetWidth: any, presetHeight: any) => {
        setWidth(presetWidth);
        setHeight(presetHeight);
        setDimensions({ width: presetWidth, height: presetHeight });
        setIsCustomDimensions(false);
        setLayers([]);
    };

    const handleClear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        setLayers([]);
    };

    const handleReferenceTemplate = async () => {
        setLoading(true);

        if (!templateRefName) {
            showMessage('Template name is required to proceed.');
            setLoading(false);
            return;
        }

        // const svgData = generateSVGFromCanvas();
        // const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const formData = new FormData();
        const imagebox = document.getElementById("imagebox");
        if (!imagebox) {
            showMessage("Image box not found!");
            setLoading(false);
            return;
        }
        if (imagebox && backgroundImage) {
            imagebox.style.backgroundImage = `url(${backgroundImage})`;
            imagebox.style.backgroundSize = "cover"; // Ensure the image covers the entire container
            imagebox.style.backgroundPosition = "center"; // Center the image
        }

        const dataUrl = await domtoimage.toPng(imagebox);
        const blob = await fetch(dataUrl).then((res) => res.blob());
        if (!blob) {
            showMessage("Failed to generate image blob.");
            setLoading(false);
            return;
        }

        formData.append('name', templateRefName);
        formData.append('templateFormat', blob, `${templateRefName}.png`);
        formData.append('height', height);
        formData.append('width', width);

        const layerData = layers.map((layer: any) => ({
            ...layer
        }));
        formData.append('layers', JSON.stringify(layerData));

        try {
            const response = await fetch(apis.templateReferenceFormatUpload, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const newTemplate = await response.json();
            if (response.ok) {
                showMessage(newTemplate.message);
                closeRefModal();
                router.push('/apps/create-template');
            } else {
                closeRefModal();
                showMessage(newTemplate.message, 'error');
            }
        } catch (error) {
            showMessage('Error uploading template', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openRefModal = () => setIsRefModalOpen(true);
    const closeRefModal = () => setIsRefModalOpen(false);

    const handleDeleteLayer = (layerToDelete: any) => {
        const updatedLayers = layers.filter((layer: any) => layer !== layerToDelete);
        setLayers(updatedLayers);
    };

    const handleAddCell = () => {
        const newX = (width / 2) - (footerWidth / 2);
        const newY = (height / 2) - (footerHeight / 2);

        const newCell = {
            id: uuidv4(),
            type: 'text',
            x: newX,
            y: newY,
            content: "",
            layerName: "",
            size: footerHeight,
            width: footerWidth,
            fillColor: "#000000",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            textAlign: "center",
            textBaseline: "middle",
            fontFamily: 'Times New Roman',
        };

        setLayers([...layers, newCell]);
    };

    const handleDrag = (id: any, dx: any, dy: any) => {
        setLayers((prevGrid: any) =>
            prevGrid.map((cell: any) => {
                if (cell.id === id) {
                    const scaleFactor = width / 450;
                    let newX = cell.x + dx * scaleFactor;
                    let newY = cell.y - dy * scaleFactor;
                    newX = Math.max(0, Math.min(width, newX));
                    newY = Math.max(0, Math.min(height, newY));

                    let newy2 = newY - cell.size;
                    let newx2 = newX + cell.width;

                    let calculatedx = (newX + newx2) / 2;
                    let calculatedy = height - ((newY + newy2) / 2);
                    return {
                        ...cell,
                        x: newX,
                        y: newY,
                        calculatedx: calculatedx,
                        calculatedy: calculatedy,
                    };
                }
                return cell;
            })
        );
    };

    const handleMouseDown = (e: any, cellId: any) => {
        e.preventDefault();
        if (selectedCellId === cellId) {
            return;
        }
        setSelectedCellId(cellId);
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleMouseMove = (e: any) => {
        if (!isDragging || !selectedCellId) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        handleDrag(selectedCellId, dx, dy);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!selectedCellId) return;
        const movement: Record<string, { dx: number; dy: number }> = {
            ArrowUp: { dx: 0, dy: -1 },
            ArrowDown: { dx: 0, dy: 1 },
            ArrowLeft: { dx: -1, dy: 0 },
            ArrowRight: { dx: 1, dy: 0 },
        };

        const move = movement[e.key as keyof typeof movement];
        if (move) {
            e.preventDefault();
            handleDrag(selectedCellId, move.dx, move.dy);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [selectedCellId, isDragging, dragStart]);

    const handleStyleChange = (id: any, styleKey: any, value: any) => {
        setLayers((prevGrid: any) =>
            prevGrid.map((cell: any) =>
                cell.id === id
                    ? { ...cell, [styleKey]: value }
                    : cell
            )
        );
    };

    const handleVariableSelect = (id: any, value: any) => {
        setSelectedVariable(value);
        setLayers((prevGrid: any) =>
            prevGrid.map((cell: any) =>
                cell.id === id ? { ...cell, content: value, layerName: value } : cell
            )
        );
    };

    const handleClose = () => {
        setSelectedCellId(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target?.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setBackgroundImage(imageUrl);
        }
    };

    const handleRemoveImage = () => {
        setBackgroundImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="main-container">
            <div className="relative flex h-full gap-3 sm:h-[calc(100vh_-_150px)]">

                {/* Left Panel */}
                <div className="panel mb-2 w-[260px] max-h-[500px] overflow-auto">
                    <div className="grid grid-cols-1 gap-2">
                        <div className="relative">
                            <h2 className="text-lg font-semibold mb-2">Canvas Settings</h2>
                            <div className="mt-1">
                                {/* Width and Height Controls */}
                                <div className="mb-3 flex items-center gap-3">
                                    <label className="block text-sm font-medium w-20">Height:</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={handleHeightChange}
                                        className="form-input w-full border rounded-lg px-2 py-1"
                                        placeholder="px"
                                    />
                                </div>
                                <div className="mb-3 flex items-center gap-3">
                                    <label className="block text-sm font-medium w-20">Width:</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={handleWidthChange}
                                        className="form-input w-full border rounded-lg px-2 py-1"
                                        placeholder="px"
                                    />
                                </div>

                                {/* Preset Dimension Buttons */}
                                <div className="mb-3">
                                    <label className="block mb-1 font-semibold">Presets:</label>
                                    <Tab.Group>
                                        <Tab.List className="grid grid-cols-2 gap-2">
                                            {/* Preset Buttons */}
                                            {[
                                                { label: "1080 x 1080px", width: 1080, height: 1080 },
                                                { label: "1080 x 566px", width: 1080, height: 566 },
                                                { label: "1080 x 1920px", width: 1080, height: 1920 },
                                                { label: "1080 x 1350px", width: 1080, height: 1350 },
                                            ].map(({ label, width, height }) => (
                                                <Tab as={Fragment} key={label}>
                                                    {({ selected }) => (
                                                        <button
                                                            onClick={() => handlePresetChange(width, height)}
                                                            className={`p-2 rounded-lg text-xs transition ${selected ? 'bg-success text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    )}
                                                </Tab>
                                            ))}
                                        </Tab.List>
                                    </Tab.Group>
                                    <div className="mt-1 text-xs font-medium">
                                        selected preset : {dimensions.width || width} x {dimensions.height || height} px
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {backgroundImage ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium italic">Remove Image</span>
                                            <button
                                                type="button"
                                                className="text-red-700"
                                                onClick={handleRemoveImage}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="px-2 py-2 btn btn-primary rounded-md"
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <IconImage className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {isUploading ? "Uploading..." : "Add Image"}
                                        </button>
                                    )}
                                </div>
                                <br />
                                <div className="relative flex flex-col gap-y-3">
                                    <h3 className="text-lg font-bold">Cell</h3>
                                    {
                                        [
                                            {
                                                label: "Height",
                                                value: selectedCellId
                                                    ? layers.find((cell: any) => cell.id === selectedCellId)?.size
                                                    : footerHeight,
                                                setter: (newValue: number) => {
                                                    setFooterHeight(newValue);
                                                    if (selectedCellId) {
                                                        const updatedLayers = layers.map((cell: any) =>
                                                            cell.id === selectedCellId ? { ...cell, size: newValue } : cell
                                                        );
                                                        setLayers(updatedLayers);
                                                    }
                                                },
                                            },
                                            {
                                                label: "Width",
                                                value: selectedCellId
                                                    ? layers.find((cell: any) => cell.id === selectedCellId)?.width
                                                    : footerWidth,
                                                setter: (newValue: number) => {
                                                    setFooterWidth(newValue);
                                                    if (selectedCellId) {
                                                        const updatedLayers = layers.map((cell: any) =>
                                                            cell.id === selectedCellId ? { ...cell, width: newValue } : cell
                                                        );
                                                        setLayers(updatedLayers);
                                                    }
                                                },
                                            },
                                        ].map(({ label, value, setter }) => (
                                            <div key={label} className="flex items-center gap-3">
                                                <label className="block text-sm font-medium w-20">{label}:</label>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => setter(Number(e.target.value))}
                                                    className="form-input w-full border rounded-lg px-2 py-1"
                                                    placeholder="px"
                                                />
                                            </div>
                                        ))
                                    }
                                    {selectedCellId !== null ? (
                                        <label className="block text-sm font-medium w-20 text-gray-500 italic">
                                            cell selected
                                        </label>
                                    ) : (
                                        <button
                                            type="button"
                                            className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-20"
                                            onClick={handleAddCell}
                                        >
                                            Add Cell
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Panel - Main Content */}
                <div className="panel flex-1" tabIndex={0} onKeyDown={(e) => handleKeyDown(e.nativeEvent)}>
                    <div className="flex flex-col items-center justify-center w-full h-auto gap-4">
                        <div className="flex gap-4 items-start">
                            <div
                                id='imagebox'
                                className="grid border border-gray-600 relative overflow-hidden"
                                style={{
                                    width: `${(450 / Math.max(width, height)) * width}px`,
                                    height: `${(450 / Math.max(width, height)) * height}px`,
                                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                {layers.map((cell: any) => (
                                    <div
                                        key={cell.id}
                                        className="absolute border border-gray-400 flex items-center justify-center cursor-pointer overflow-hidden"
                                        style={{
                                            width: `${cell.width * scalingFactor}px`,
                                            height: `${cell.size * scalingFactor}px`,
                                            top: `${450 - (((cell.y / height)) * 450)}px`,
                                            left: `${((cell.x / width)) * 450}px`,
                                            fontWeight: cell.fontWeight,
                                            fontStyle: cell.fontStyle,
                                            fontFamily: cell.fontFamily,
                                            textDecoration: cell.textDecoration,
                                            color: cell.fillColor,
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, cell.id)}
                                    >
                                        <span
                                            style={{
                                                fontSize: `${cell.size * scalingFactor}px`,
                                                color: cell.fillColor,
                                            }}
                                        >
                                            {cell.content}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="relative">
                                {Array.from({ length: Math.ceil(Math.max(width, height) / 100) + 1 }).map((_, index) => {
                                    const originalHeightValue = index * 100;
                                    const scaledPosition = (originalHeightValue / Math.max(width, height)) * 450;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                position: "absolute",
                                                top: `${scaledPosition}px`,
                                                transform: "translateY(-50%)",
                                            }}
                                            className="text-xs text-gray-600"
                                        >
                                            {originalHeightValue}px
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel with Buttons */}
                <div className="panel mb-5 w-[260px] p-2 bg-white shadow-md rounded-md">
                    {selectedCellId !== null ? (
                        <>
                            <div className="flex items-end gap-2">
                                <h4 className="text-sm font-medium">Variable :</h4>
                                <span
                                    className="text-sm font-medium text-blue-600 cursor-pointer"
                                    onClick={() => {
                                        if (isCustom === true) {
                                            setIsCustom(false);
                                        } else {
                                            setIsCustom(true);
                                        }
                                    }}
                                >
                                    {(isCustom) ? "Variable" : "Custom"}
                                </span>
                            </div>

                            {(isCustom) ? (
                                <input
                                    type="text"
                                    className="form-input mb-2 p-2 border rounded"
                                    value={customValue}
                                    placeholder="Enter text here..."
                                    onChange={(e) => {
                                        setCustomValue(e.target.value);
                                        handleVariableSelect(selectedCellId, e.target.value);
                                    }}
                                    onBlur={() => setIsCustom(false)}
                                />
                            ) : (
                                <select
                                    className="form-select mb-2 p-2 border rounded"
                                    onChange={(e) => handleVariableSelect(selectedCellId, e.target.value)}
                                    value={layers.find((cell: any) => cell.id === selectedCellId)?.content || ""}
                                >
                                    <option value="">Select Variable</option>
                                    {variables.map((variable: any) => (
                                        <option key={variable.name} value={variable.name}>
                                            {variable.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <h4 className="text-sm font-medium">Font Weight :</h4>
                            <select
                                value={layers.find((cell: any) => cell.id === selectedCellId)?.fontWeight || 'normal'}
                                onChange={(e) => handleStyleChange(selectedCellId, "fontWeight", e.target.value)}
                                className="p-2 border rounded mb-2 w-full"
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="lighter">Lighter</option>
                            </select>

                            <h4 className="text-sm font-medium">Font Style :</h4>
                            <select
                                value={layers.find((cell: any) => cell.id === selectedCellId)?.fontStyle || 'normal'}
                                onChange={(e) => handleStyleChange(selectedCellId, "fontStyle", e.target.value)}
                                className="p-2 border rounded mb-2 w-full"
                            >
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                                <option value="oblique">Oblique</option>
                            </select>

                            <h4 className="text-sm font-medium">Font Family :</h4>
                            <select
                                value={layers.find((cell: any) => cell.id === selectedCellId)?.fontFamily || 'Times New Roman'}
                                onChange={(e) => handleStyleChange(selectedCellId, "fontFamily", e.target.value)}
                                className="p-2 border rounded mb-2 w-full"
                            >
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Courier New">Courier New</option>
                            </select>

                            <h4 className="text-sm font-medium">Text Decoration :</h4>
                            <select
                                value={layers.find((cell: any) => cell.id === selectedCellId)?.textDecoration || 'none'}
                                onChange={(e) => handleStyleChange(selectedCellId, "textDecoration", e.target.value)}
                                className="p-2 border rounded mb-2 w-full"
                            >
                                <option value="none">None</option>
                                <option value="underline">Underline</option>
                            </select>

                            <h4 className="text-sm font-medium">Font Color :</h4>
                            <input
                                type="color"
                                value={layers.find((cell: any) => cell.id === selectedCellId)?.fillColor || "#000000"}
                                onChange={(e) => handleStyleChange(selectedCellId, "fillColor", e.target.value)}
                                className="p-2 border rounded mb-2 w-full"
                            />

                            <button className="p-2 bg-red-500 text-white rounded w-full" onClick={handleClose}>
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center mb-3">
                                <button
                                    type="button"
                                    className="btn btn-success flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                                    onClick={openRefModal}
                                >
                                    <IconSave className="shrink-0" />
                                    Save
                                </button>
                            </div>
                            <button type="button" className="btn btn-outline-primary" onClick={handleClear}>
                                <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Clear
                            </button>
                            <br />
                            <span className="flex items-center mb-3">Layers</span>

                            <div className="bg-white p-2 rounded-md shadow-md">
                                {layers.length > 0 ? (
                                    <ul className="divide-y divide-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {layers.map((layer: any) => (
                                            <li
                                                key={layer.id}
                                                className={`flex items-center justify-between p-2 cursor-pointer ${selectedLayer === layer ? 'bg-blue-100' : ''}`}
                                                onClick={() => setSelectedLayer(layer)}
                                            >
                                                <span>{layer.layerName}</span>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleDeleteLayer(layer)} className="text-red-600 hover:text-red-900">
                                                        <IconTrashLines />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-center">No layers available</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* SAVE REF TEMPLATE */}
                {isRefModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Enter Template Name</h2>
                            <input
                                type="text"
                                className="form-input w-full border border-gray-300 p-2 rounded-md mb-4"
                                value={templateRefName}
                                onChange={(e) => setTemplateRefName(e.target.value)}
                                placeholder="Template name"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                    onClick={closeRefModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={handleReferenceTemplate}
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
                                    ) : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ComponentsAppsCreateNewTemplate;
