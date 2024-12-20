'use client';
//LIBRARIES
import React, { useState, Fragment, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import AnimateHeight from 'react-animate-height';
import Head from 'next/head';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'

//COMPONENTS
import IconSave from '@/components/icon/icon-save';
import IconSend from '@/components/icon/icon-send';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconArrowForward from '@/components/icon/icon-arrow-forward';

//FILES
import '../../../styles/style.css';
import 'react-quill/dist/quill.snow.css';
import CustomEditor from './components-quill';
import apis from '../../../public/apis';

const ComponentsAppsCreateNewTemplate = () => {
    const router = useRouter();

    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    } const [activeDropdown, setActiveDropdown] = useState<string>('');

    const [height, setHeight] = useState<any>(1080);
    const [width, setWidth] = useState<any>(1080);
    const [backgroundColor, setBackgroundColor] = useState<any>('#ffffff');
    const [dimensions, setDimensions] = useState<any>({ width: 1080, height: 1080 });

    const [isUploading, setIsUploading] = useState<any>(false);
    const [templateImages, setTemplateImages] = useState<any>(null);
    const fileInputRef = useRef<any>(null);
    const formatInputRef = useRef<any>(null);
    const [variables, setAllVariables] = useState<any>([]);
    const [templateName, setTemplateName] = useState<any>('');
    const [variableKey, setVariableKey] = useState<any>('');
    const [templateRefName, setTemplateRefName] = useState<any>('');
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<any>(false);
    const [isRefModalOpen, setIsRefModalOpen] = useState<any>(false);
    const [editorText, setEditorText] = useState<any>('');

    const canvasRef = useRef<any>(null);
    const [context, setContext] = useState<any>(null);
    const [history, setHistory] = useState<any>([]);
    const [layers, setLayers] = useState<any>([]);
    const [isDragging, setIsDragging] = useState<any>(false);
    const [selectedLayer, setSelectedLayer] = useState<any>(null);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<any>(-1);
    const [activeLayerIndex, setActiveLayerIndex] = useState<any>(null);
    const positions = [
        `Bottom Left (x150-y${height - 70})`,
        `Bottom-Middle-Up (x${width / 2}-y${height - 80})`,
        `Bottom Middle (x${width / 2}-y${height - 50})`,
        `Bottom-Middle-Down (x${width / 2}-y${height - 20})`,
        // `Bottom Right (x${width - 160}-y${height - 50})`,
        `Bottom-Right-Up (x${width - 160}-y${height - 80})`,
        `Bottom Right (x${width - 160}-y${height - 50})`,
        `Bottom-Right-Down (x${width - 160}-y${height - 20})`,
    ];
    const [selectedPosition, setSelectedPosition] = useState<any>('');
    const [selectedVariable, setSelectedVariable] = useState<any>('');
    const [customX, setCustomX] = useState<any>(null);
    const [customY, setCustomY] = useState<any>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [isCustomDimensions, setIsCustomDimensions] = useState(false);

    // Effect to set the canvas context and initialize background
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setContext(ctx);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gridSize = 20;
        drawGrid(ctx, canvas.width, canvas.height, gridSize);
    }, []);

    // Redraw the canvas when dimensions, background color, or layers change
    useEffect(() => {
        if (context) {
            const canvas = canvasRef.current;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            canvas.width = width;
            canvas.height = height;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            ctx.putImageData(savedImageData, 0, 0);

            drawCanvas(ctx, canvas);
        }
    }, [width, height, backgroundColor, layers]);

    //FETCH TEMPLATE IMAGES
    useEffect(() => {
        const fetchTemplateImages = async () => {
            try {
                const response = await fetch(apis.getAllTemplateImages, {
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
                setTemplateImages(data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchTemplateImages();
    }, []);

    //FETCH ALL VARIABLES
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

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number) => {
        ctx.strokeStyle = '#BFBFBF';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const handleMouseDown = (e: any) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ctx = canvas.getContext('2d');
            const layerIndex = layers.findIndex((layer: any) => {
                const { x: layerX, y: layerY, type } = layer;
                if (type === 'svg') {
                    return (
                        x >= layerX &&
                        x <= layerX + layer.content.width &&
                        y >= layerY &&
                        y <= layerY + layer.content.height
                    );
                } else if (type === 'text') {
                    ctx.font = `${layer.size || layer.fontSize}px ${layer.fontFamily || 'Arial'}`;
                    const textWidth = ctx.measureText(layer.content).width;
                    return (
                        x >= layerX &&
                        x <= layerX + textWidth &&
                        y >= layerY - (layer.size || layer.fontSize) &&
                        y <= layerY
                    );
                }
                return false;
            });

            if (layerIndex >= 0) {
                setActiveLayerIndex(layerIndex);
                setIsDragging(true);
            }
        }
    };

    const handleMouseMove = (e: any) => {
        if (activeLayerIndex === null || !isDragging) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setLayers((prevLayers: any) => {
                const updatedLayers = [...prevLayers];
                const activeLayer = updatedLayers[activeLayerIndex];
                activeLayer.x = x;
                activeLayer.y = y;
                return updatedLayers;
            });
            drawCanvas(context, canvas);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setActiveLayerIndex(null);
        setSelectedLayer(null);
    };

    const drawCanvas = (ctx: any, canvas: any) => {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gridSize = 20;
        drawGrid(ctx, canvas.width, canvas.height, gridSize);

        layers.forEach((layer: any) => {
            if (layer.type === 'image') {
                ctx.drawImage(layer.content, layer.x, layer.y, layer.width, layer.height);
            } else if (layer.type === 'text') {
                const quillClassMapping: { [key: string]: string } = {
                    'ql-size-small': '18px',
                    'ql-size-large': '38px',
                    'ql-size-huge': '66px',
                    'ql-font-serif': 'serif',
                    'ql-font-monospace': 'monospace',
                    'ql-font-sans-serif': 'sans-serif',
                    'ql-font-roboto': 'Roboto',
                    'ql-font-open-sans': 'Open Sans',
                    'ql-font-lato': 'Lato'
                };

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = layer.content;

                const paragraphs = tempDiv.querySelectorAll('p');
                let currentY = layer.y;

                paragraphs.forEach((paragraph) => {
                    const spanContent = paragraph.querySelectorAll('span, em, strong, u');
                    let text = paragraph.innerText || paragraph.textContent || '';

                    let fontSize = '24px';
                    let fontFamily = 'Times New Roman';
                    let fontWeight = 'normal';
                    let fontStyle = 'normal';
                    let textDecoration = 'none';
                    let fillColor = 'black';

                    spanContent.forEach((element: any) => {
                        element.classList.forEach((cls: string) => {
                            if (cls in quillClassMapping) {
                                if (cls.startsWith('ql-font')) fontFamily = quillClassMapping[cls];
                                if (cls.startsWith('ql-size')) fontSize = quillClassMapping[cls];
                            }
                        });

                        const style = element.getAttribute('style');
                        if (style) {
                            const colorMatch = style.match(/color:\s*([^;]+);?/i);
                            if (colorMatch) fillColor = colorMatch[1];
                            if (style.includes('font-weight: bold')) fontWeight = 'bold';
                            if (style.includes('font-style: italic')) fontStyle = 'italic';
                            if (style.includes('text-decoration: underline')) textDecoration = 'underline';
                        }

                        if (element.tagName === 'STRONG') fontWeight = 'bold';
                        if (element.tagName === 'EM') fontStyle = 'italic';
                        if (element.tagName === 'U') textDecoration = 'underline';
                    });

                    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
                    ctx.fillStyle = fillColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'center';

                    const textX = layer.x;
                    const textY = currentY;
                    ctx.fillText(text, textX, textY);
                    if (textDecoration === 'underline') {
                        const textWidth = ctx.measureText(text).width;
                        const underlineY = textY + parseFloat(fontSize) * 0.1;
                        ctx.beginPath();
                        ctx.moveTo(textX - (textWidth / 2), underlineY);
                        ctx.lineTo(textX + (textWidth / 2), underlineY);
                        ctx.strokeStyle = fillColor;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            } else if (layer.type === 'rect') {
                ctx.fillStyle = layer.fillColor;
                ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
            }
        });
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

    const addImageLayer = (imageSrc: any) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            setLayers((prev: any) => [...prev, { type: 'image', content: img, x: 0, y: 0, width: img.width / 2, height: img.height / 2 }]);
        };
    };

    const handlePositionChange = (e: any) => {
        const selectedValue = e.target?.value;
        setSelectedPosition(selectedValue);
        const { x, y } = calculatePosition(selectedValue);

        setCustomX(x);
        setCustomY(y);
    };

    const handleCustomXChange = (e: any) => {
        setCustomX(Number(e.target?.value));
        setSelectedPosition('');
    };

    const handleCustomYChange = (e: any) => {
        setCustomY(Number(e.target.value));
        setSelectedPosition('');
    };

    const calculatePosition = (position: any) => {
        let x, y;
        switch (position) {
            case `Bottom Left (x150-y${height - 70})`:
                x = 150;
                y = height - 70;
                break;

            case `Bottom-Middle-Up (x${width / 2}-y${height - 80})`:
                x = width / 2;
                y = height - 80;
                break;

            case `Bottom Middle (x${width / 2}-y${height - 50})`:
                x = width / 2;
                y = height - 50;
                break;

            case `Bottom-Middle-Down (x${width / 2}-y${height - 20})`:
                x = width / 2;
                y = height - 20;
                break;

            // case `Bottom Right (x${width - 160}-y${height - 50})`:
            //     x = width - 160;
            //     y = height - 50;
            //     break;

            case `Bottom-Right-Up (x${width - 160}-y${height - 80})`:
                x = width - 160;
                y = height - 80;
                break;

            case `Bottom Right (x${width - 160}-y${height - 50})`:
                x = width - 160;
                y = height - 50;
                break;

            case `Bottom-Right-Down (x${width - 160}-y${height - 20})`:
                x = width - 160;
                y = height - 20;
                break;

            default:
                x = 0;
                y = 0;
        }
        return { x, y };
    };

    const addTextLayer = () => {
        if (editorText) {
            const { x, y } = calculatePosition(selectedPosition);
            setLayers((prev: any) => [
                ...prev,
                {
                    id: uuidv4(),
                    type: 'text',
                    layerName: selectedVariable,
                    content: editorText,
                    x: customX !== null ? customX : x,
                    y: customY !== null ? customY : y,
                    size: 24
                }
            ]);
        }
        setEditorText('');
        setSelectedVariable('');
    };

    const toggleDropdown = (dropdownName: any) => {
        setActiveDropdown((prev) => (prev === dropdownName ? '' : dropdownName));
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
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleUploadClickFormat = () => {
        formatInputRef.current.click();
    };

    const handleFileChange = async (event: any) => {
        const file = event.target?.files[0];
        if (file) {
            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append('templateImages', file);
                const response = await fetch(apis.templateImageUpload, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    setTemplateImages((prevImages: any) => [...prevImages, result.data]);
                    showMessage(result.message);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                alert('An error occurred while uploading the image.');
            }
            setIsUploading(false);
        }
    };

    const handleDragStart = (e: any, item: any) => {
        e.dataTransfer.setData('text/plain', item?.templateImages?.url);
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        if (!canvas || !rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (data.startsWith('<svg')) {
            const svgBlob = new Blob([data], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, x, y);
                URL.revokeObjectURL(url);
            };

            const newLayer = {
                id: uuidv4(),
                type: 'svg',
                layerName: 'svg',
                content: img,
                x: x,
                y: y,
                width: img.width || 64,
                height: img.height || 64,
            };

            setLayers((prevLayers: any) => {
                const newLayers = [...prevLayers, newLayer];
                setHistory((prevHistory: any) => {
                    const newHistory = [...prevHistory, newLayers];
                    setCurrentHistoryIndex(newHistory.length - 1);
                    return newHistory;
                });
                return newLayers;
            });

            img.src = url;
        } else {
            const img = new Image();
            img.src = data;
            img.crossOrigin = "anonymous";

            img.onload = () => {
                const canvasAspectRatio = canvas.width / canvas.height;
                const imgAspectRatio = img.width / img.height;

                let imgWidth, imgHeight;

                if (canvasAspectRatio > imgAspectRatio) {
                    imgHeight = canvas.height;
                    imgWidth = img.width * (imgHeight / img.height);
                } else {
                    imgWidth = canvas.width;
                    imgHeight = img.height * (imgWidth / img.width);
                }

                const centeredX = (canvas.width - imgWidth) / 2;
                const centeredY = (canvas.height - imgHeight) / 2;

                const newLayer = {
                    id: uuidv4(),
                    type: 'image',
                    layerName: 'image',
                    content: img,
                    x: centeredX,
                    y: centeredY,
                    width: imgWidth,
                    height: imgHeight,
                };

                setLayers((prevLayers: any) => {
                    const newLayers = [...prevLayers, newLayer];

                    setActiveLayerIndex(newLayers.length - 1);
                    setHistory((prevHistory: any) => {
                        const newHistory = [...prevHistory, newLayers];
                        setCurrentHistoryIndex(newHistory.length - 1);
                        return newHistory;
                    });

                    return newLayers;
                });
                drawCanvas(ctx, canvas);
            };
        }
    };

    const handleClear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        setLayers([]);
        setHistory([]);
        setCurrentHistoryIndex(-1);
    };

    const handleUndo = () => {
        if (currentHistoryIndex > 0) {
            const newIndex = currentHistoryIndex - 1;
            setCurrentHistoryIndex(newIndex);
            const previousLayers = history[newIndex];
            setLayers(previousLayers);
            drawCanvas(context, previousLayers);
        }
    };

    const handleRedo = () => {
        if (currentHistoryIndex < history.length - 1) {
            const newIndex = currentHistoryIndex + 1;
            setCurrentHistoryIndex(newIndex);
            const nextLayers = history[newIndex];
            setLayers(nextLayers);
            drawCanvas(context, nextLayers);
        }
    };

    const handleReferenceTemplate = async () => {
        setLoading(true);

        if (!templateRefName) {
            alert('Template name is required to proceed.');
            setLoading(false);
            return;
        }

        const svgData = generateSVGFromCanvas();
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const formData = new FormData();
        formData.append('name', templateRefName);
        formData.append('templateFormat', blob, `${templateRefName}.svg`);
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

    const generateSVGFromCanvas = () => {
        const canvas = canvasRef.current;

        const dataURL = canvas.toDataURL("image/png");
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                <image href="${dataURL}" width="${canvas.width}" height="${canvas.height}" />
            </svg>
        `;

        return svgContent;
    };

    const onDragEnd = (result: any) => {
        const { source, destination } = result;

        if (!destination || source.index === destination.index) return;

        const reorderedLayers = Array.from(layers);
        const [removed] = reorderedLayers.splice(source.index, 1);
        reorderedLayers.splice(destination.index, 0, removed);

        setLayers(reorderedLayers);
    };

    const handleVariableChange = (e: any) => {
        const selectedValue = e.target.value;
        setSelectedVariable(selectedValue);
        setEditorText(selectedValue);
    };

    const addRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        fillColor: string
    ) => {
        setLayers((prev: any) => [
            ...prev,
            {
                id: Date.now().toString(),
                type: 'rect',
                x,
                y,
                width,
                height,
                fillColor,
                isDrawn: true,
                layerName: 'Shape Layer'
            }
        ]);
    };

    const handleShapeDragStart = (e: any, shape: string) => {
        if (!e.dataTransfer) {
            console.error('DataTransfer is null');
            return;
        }

        e.dataTransfer.setData('text/plain', shape);
    };

    return (
        <div className="main-container">
            <div className="relative flex h-full gap-3 sm:h-[calc(100vh_-_150px)]">

                {/* Left Panel with Dropdown */}
                <div className="panel mb-3 w-[260px] ">
                    <div className="grid grid-cols-1 gap-4">

                        {(activeDropdown === '' || activeDropdown === 'canvas') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all flex justify-between items-center"
                                    onClick={() => toggleDropdown('canvas')}
                                >
                                    Canvas Settings
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'canvas' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>
                                <AnimateHeight duration={300} height={activeDropdown === 'canvas' ? 'auto' : 0}>
                                    <div className="mt-2">
                                        {/* Width and Height Controls */}
                                        <div className="mb-5">
                                            <label>Height:</label>
                                            <input
                                                type="number"
                                                value={height}
                                                onChange={handleHeightChange}
                                                className="form-input"
                                                placeholder="px"
                                            />
                                        </div>
                                        <div className="mb-5">
                                            <label>Width:</label>
                                            <input
                                                type="number"
                                                value={width}
                                                onChange={handleWidthChange}
                                                className="form-input"
                                                placeholder="px"
                                            />
                                        </div>

                                        {/* Preset Dimension Buttons */}
                                        <div className="mb-5">
                                            <label className="block mb-2 font-semibold">Presets:</label> {/* Add spacing and make label bold */}
                                            <Tab.Group>
                                                <Tab.List className="grid grid-cols-2 gap-4 mt-2"> {/* Increase gap for better spacing */}
                                                    {/* Preset 1080x1080 */}
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                onClick={() => handlePresetChange(1080, 1080)}
                                                                className={`p-3 rounded-lg transition duration-200 ease-in-out ${selected ? 'bg-success text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                            >
                                                                1080 * 1080px
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    {/* Preset 1080x566 */}
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                onClick={() => handlePresetChange(1080, 566)}
                                                                className={`p-3 rounded-lg transition duration-200 ease-in-out ${selected ? 'bg-success text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                            >
                                                                1080 * 566px
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    {/* Preset 1080x1920 */}
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                onClick={() => handlePresetChange(1080, 1920)}
                                                                className={`p-3 rounded-lg transition duration-200 ease-in-out ${selected ? 'bg-success text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                            >
                                                                1080 * 1920px
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    {/* Preset 1080x1350 */}
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                onClick={() => handlePresetChange(1080, 1350)}
                                                                className={`p-3 rounded-lg transition duration-200 ease-in-out ${selected ? 'bg-success text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                            >
                                                                1080 * 1350px
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>
                                            </Tab.Group>
                                            <div className="mt-4 font-medium">
                                                Selected dimensions: {dimensions.width ? dimensions.width : width} x {dimensions.height ? dimensions.height : height} px
                                            </div>
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        )}

                        {(activeDropdown === '' || activeDropdown === 'upload') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all flex justify-between items-center"
                                    onClick={() => toggleDropdown('upload')}
                                >
                                    Upload Image
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'upload' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>

                                <AnimateHeight duration={300} height={activeDropdown === 'upload' ? 'auto' : 0}>
                                    <div className="p-2">
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef} // Reference to input
                                                    onChange={handleFileChange} // Handle file change
                                                    className="hidden" // Hide the default file input
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-success bg-green-500 text-white hover:bg-green-600 rounded-md px-4 py-2"
                                                    onClick={handleUploadClick} // Trigger file input click
                                                >
                                                    <IconSend className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                    {isUploading ? 'Uploading...' : 'Upload'}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-danger   bg-red-500 text-white hover:bg-red-600 rounded-md px-4 py-2"
                                            >
                                                <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                Delete
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <Tab.Group>
                                                <Tab.List className="flex w-full border-b border-gray-200">
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'border-b-2 border-secondary text-secondary' : ''
                                                                    } flex-1 py-2 text-center text-gray-700 hover:text-secondary transition-colors`}
                                                            >
                                                                Images
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>

                                                <Tab.Panels className="mt-4">
                                                    <Tab.Panel>
                                                        <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                                                            {Array.isArray(templateImages) && templateImages.length > 0 ? (
                                                                templateImages.map((item: any, index: any) => (
                                                                    <div key={item?._id} className="border rounded overflow-hidden">
                                                                        <img
                                                                            src={item?.templateImages?.url}
                                                                            alt={`Thumbnail ${index + 1}`}
                                                                            className="w-full h-20 object-cover rounded"
                                                                            draggable
                                                                            onDragStart={(e) => handleDragStart(e, item)} // Pass item to drag handler
                                                                        />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-center">No images available</p>
                                                            )}
                                                        </div>
                                                    </Tab.Panel>
                                                </Tab.Panels>
                                            </Tab.Group>
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        )}

                        {/* {(activeDropdown === '' || activeDropdown === 'shapes') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all flex justify-between items-center"
                                    onClick={() => toggleDropdown('shapes')}
                                >
                                    Shapes
                                    <span
                                        className={`inline-block transition-transform duration-300 ${activeDropdown === 'shapes' ? 'rotate-180' : ''
                                            }`}
                                    >
                                        <IconCaretDown />
                                    </span>
                                </button>

                                <AnimateHeight
                                    duration={300}
                                    height={activeDropdown === 'shapes' ? 'auto' : 0}
                                >
                                    <div className="p-2">
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Rectangle', 'Circle', 'Triangle'].map((shape, index) => (
                                                <div
                                                    key={index}
                                                    className="border rounded p-2 text-center cursor-pointer hover:bg-gray-200 flex justify-center items-center"
                                                    draggable
                                                    onDragStart={(e: React.DragEvent) => handleShapeDragStart(e, shape)}
                                                >
                                                    {shape === 'Rectangle' && (
                                                        <svg width="50" height="30" className="fill-blue-500">
                                                            <rect width="50" height="30" />
                                                        </svg>
                                                    )}
                                                    {shape === 'Circle' && (
                                                        <svg width="40" height="40" className="fill-red-500">
                                                            <circle cx="20" cy="20" r="20" />
                                                        </svg>
                                                    )}
                                                    {shape === 'Triangle' && (
                                                        <svg width="50" height="40" viewBox="0 0 50 50" className="fill-green-500">
                                                            <polygon points="25,0 50,50 0,50" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        )} */}

                        {(activeDropdown === '' || activeDropdown === 'typography') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="btn w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all flex justify-between items-center"
                                    onClick={() => toggleDropdown('typography')}
                                >
                                    Typography
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'typography' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>
                                <div>
                                    <AnimateHeight duration={300} height={activeDropdown === 'typography' ? 'auto' : 0}>
                                        <br />
                                        <div
                                            className="items-center overflow-auto"
                                            style={{
                                                maxHeight: '400px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                padding: '1rem',
                                            }}
                                        >
                                            <Head>
                                                <link
                                                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Open+Sans:wght@400;500;700&display=swap"
                                                    rel="stylesheet"
                                                />
                                            </Head>

                                            {/* Custom Editor */}
                                            <select
                                                className="form-select"
                                                onChange={handleVariableChange}
                                                value={selectedVariable}
                                                style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}
                                            >
                                                <option value="">Select Variable</option>
                                                {Array.isArray(variables) &&
                                                    variables.map((variable) => (
                                                        <option key={variable.name} value={variable.name}>
                                                            {variable.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <CustomEditor
                                                onChange={(text) => setEditorText(text)}
                                                value={editorText}
                                            />
                                            <br />
                                            <select
                                                className="form-select"
                                                onChange={handlePositionChange}
                                                value={selectedPosition}
                                                style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}
                                            >
                                                <option value="">Select Position</option>
                                                {positions.map((position) => (
                                                    <option key={position} value={position}>
                                                        {position}
                                                    </option>
                                                ))}
                                            </select>
                                            <div
                                                className="grid"
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '1rem',
                                                    maxWidth: '300px',
                                                    width: '100%',
                                                }}
                                            >
                                                <div style={{ flex: '1 1 45%' }}>
                                                    <label style={{ fontWeight: 500 }}>X (pixels) :</label>
                                                    <input
                                                        type="number"
                                                        value={customX !== null ? customX : calculatePosition(selectedPosition).x}
                                                        onChange={handleCustomXChange}
                                                        className="form-control"
                                                        placeholder="Custom X"
                                                    />
                                                </div>
                                                <div style={{ flex: '1 1 45%' }}>
                                                    <label style={{ fontWeight: 500 }}>Y (pixels) :</label>
                                                    <input
                                                        type="number"
                                                        value={customY !== null ? customY : calculatePosition(selectedPosition).y}
                                                        onChange={handleCustomYChange}
                                                        className="form-control"
                                                        placeholder="Custom Y"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={addTextLayer}
                                                style={{ padding: '0.5rem 1rem', fontWeight: 500 }}
                                            >
                                                Add Text
                                            </button>
                                        </div>
                                    </AnimateHeight>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Panel - Main Content */}
                <div className="panel flex-1">
                    {/* Button section */}
                    {/* <div className="flex flex-wrap mb-4 gap-2"> */}
                    {/* <button type="button" className="btn btn-outline-warning" onClick={handleUndo}>
                            <IconArrowBackward className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Undo
                        </button>
                        <button type="button" className="btn btn-outline-success" onClick={handleRedo}>
                            <IconArrowForward className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Redo
                        </button> */}
                    {/* </div> */}

                    {/* Canvas section */}
                    <div className="flex items-center justify-center w-full h-auto">
                        <div
                            className="relative flex items-center justify-center"
                            style={{
                                width: `${(450 / Math.max(width, height)) * width}px`,
                                height: `${(450 / Math.max(width, height)) * height}px`,
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={width}
                                height={height}
                                className="border border-gray-400"
                                onDrop={(e) => {
                                    handleDrop(e);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel with Buttons */}
                <div className="panel mb-5 w-[260px] p-2 bg-white shadow-md rounded-md">
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
                    <span className="flex items-center mb-3">
                        Layers
                    </span>

                    {/* Display the list of layers */}
                    <div className="bg-white p-2 rounded-md shadow-md">
                        {layers.length > 0 ? (
                            <ul className="divide-y divide-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <ul>
                                    {layers.map((layer: any, index: number) => (
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
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center">No layers available</p>
                        )}
                    </div>
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
