'use client';
import '../../../styles/style.css';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconSend from '@/components/icon/icon-send';
import React, { useState, Fragment, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import { Tab } from '@headlessui/react';
import 'react-quill/dist/quill.snow.css';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import Head from 'next/head';
import CustomEditor from './components-quill';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/icon/icon-arrow-backward';
import IconArrowForward from '@/components/icon/icon-arrow-forward';
import IconCopy from '@/components/icon/icon-copy';
import IconLink from '@/components/icon/icon-link';
import IconPlus from '@/components/icon/icon-plus';
import apis from '../../../public/apis';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js'; // Import Tesseract.js
import { createRoot } from 'react-dom/client';

const ComponentsAppsCreateNewTemplate = () => {
    const token = localStorage.getItem('authToken');
    const [activeDropdown, setActiveDropdown] = useState<string>('');

    const [height, setHeight] = useState(1080);
    const [width, setWidth] = useState(1080);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [dimensions, setDimensions] = useState({ width: 1080, height: 1080 });

    const [isUploading, setIsUploading] = useState(false); // State to manage the uploading status
    const [templateImages, setTemplateImages] = useState(null); // State for the selected file
    const [templateVideos, setTemplateVideos] = useState(null); // State for the selected file
    const fileInputRef = useRef(null); // Use ref to trigger the hidden input click programmatically
    const formatInputRef = useRef(null); // Use ref to trigger the hidden input click programmatically
    const [allTemplates, setAllTemplates] = useState(null); // State for the selected file
    const [templateName, setTemplateName] = useState(''); // State for template name
    const [isModalOpen, setIsModalOpen] = useState(false); // For controlling modal visibility
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [editorText, setEditorText] = useState('');

    const shapes = [
        { name: 'Circle', svg: <svg width="64" height="64"><circle cx="32" cy="32" r="30" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Square', svg: <svg width="64" height="64"><rect width="60" height="60" x="2" y="2" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Triangle', svg: <svg width="64" height="64"><polygon points="32,4 64,60 0,60" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Rectangle', svg: <svg width="64" height="64"><rect width="60" height="30" x="2" y="17" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Oval', svg: <svg width="64" height="64"><ellipse cx="32" cy="32" rx="30" ry="20" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Hexagon', svg: <svg width="64" height="64"><polygon points="32,4 60,18 60,46 32,60 4,46 4,18" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Star', svg: <svg width="64" height="64"><polygon points="32,4 38,24 60,24 42,38 48,58 32,46 16,58 22,38 4,24 26,24" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Pentagon', svg: <svg width="64" height="64"><polygon points="32,4 58,24 48,58 16,58 6,24" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Rhombus', svg: <svg width="64" height="64"><polygon points="32,4 60,32 32,60 4,32" stroke="black" strokeWidth="2" fill="none" /></svg> },
        { name: 'Parallelogram', svg: <svg width="64" height="64"><polygon points="10,4 54,4 44,60 0,60" stroke="black" strokeWidth="2" fill="none" /></svg> }
    ];

    const emojis = [
        // Faces
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩',
        '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤',

        // Animals & Nature
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧',
        '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪲', '🐛', '🐌', '🦋', '🐞', '🐜', '🦂', '🐢',

        // Food & Drink
        '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
        '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🍕', '🍔', '🍟', '🌭', '🌮', '🍿',

        // Travel & Places
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚜', '🛵', '🚲', '🛴', '🚨', '🚂', '🚉', '✈️', '🛫', '🛬', '🛳️', '⛴️',
        '🛥️', '🚤', '🛶', '🚢', '🏠', '🏡', '🏘️', '🏚️', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰',

        // Objects
        '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📞', '☎️',
        '📟', '📠', '📺', '📻', '⏰', '⏲️', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🛢️', '💸', '💵', '💴', '💶', '💷',

        // Symbols
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️',
        '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'
    ];

    const [visibleShapes, setVisibleShapes] = useState(6); // Initially show 4 shapes
    const [visibleEmojis, setVisibleEmojis] = useState(20);

    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [layers, setLayers] = useState([]); // Track layers in the state
    const [activeLayer, setActiveLayer] = useState(null);
    const [isDragging, setIsDragging] = useState(false); // Track if an item is being dragged
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [activeLayerIndex, setActiveLayerIndex] = useState(null); // Track active layer

    // Effect to set the canvas context and initialize background
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setContext(ctx);

        // Set a plain white background initially
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    //FETCH TEMPLATE VIDEOS
    useEffect(() => {
        const fetchTemplateVideos = async () => {
            // try {
            //     const response = await fetch(apis.getAllTemplateImages, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //             'Authorization': `Bearer ${token}`,
            //         },
            //     });
            //     const data = await response.json();
            //     if (!response.ok) {
            //         showMessage(data.message, 'error');
            //         throw new Error(`HTTP error! status: ${response.status}`);
            //     }
            //     console.log("Images : ", data);
            //     setTemplateVideos(data);
            // } catch (error) {
            //     console.error('Error fetching contacts:', error);
            // }
        };

        fetchTemplateVideos();
    }, []);

    //FETCH ALL TEMPLATES
    useEffect(() => {
        const fetchAllTemplates = async () => {
            try {
                const response = await fetch(apis.getAllTemplateFormat, {
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
                setAllTemplates(data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchAllTemplates();
    }, []);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');

        const layerIndex = layers.findIndex(layer => {
            const { x: layerX, y: layerY, type } = layer;

            if (type === 'svg') {
                return (
                    x >= layerX &&
                    x <= layerX + layer.content.width &&
                    y >= layerY &&
                    y <= layerY + layer.content.height
                );
            } else if (type === 'emoji' || type === 'text') {
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
            setIsDragging(true); // Start dragging
        }
    };

    const handleMouseMove = (e) => {
        if (activeLayerIndex === null || !isDragging) return; // No active layer or not dragging

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setLayers((prevLayers) => {
            const updatedLayers = [...prevLayers];
            const activeLayer = updatedLayers[activeLayerIndex];

            // Update the position of the active layer
            activeLayer.x = x;
            activeLayer.y = y;
            return updatedLayers;
        });

        drawCanvas(context, canvas); // Redraw canvas with updated layer position
    };

    const handleMouseUp = () => {
        setIsDragging(false); // Stop dragging
        setActiveLayerIndex(null); // Clear active layer on mouse up
        setSelectedLayer(null);
    };

    const drawCanvas = (ctx, canvas) => {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor || 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        layers.forEach((layer) => {
            if (layer.type === 'image') {
                ctx.drawImage(layer.content, layer.x, layer.y, layer.width, layer.height);
            } else if (layer.type === 'text') {
                console.log('Drawing content:', layer.content);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = layer.content;
                const textElements = tempDiv.querySelectorAll('p, em, strong'); // You can add more tags as needed
                let currentY = layer.y;

                textElements.forEach((textElement) => {
                    const fontSize = window.getComputedStyle(textElement).fontSize || '24px';
                    const fontFamily = window.getComputedStyle(textElement).fontFamily || 'Times New Roman';
                    ctx.font = `${fontSize} ${fontFamily}`;
                    ctx.fillStyle = window.getComputedStyle(textElement).color || 'black';

                    const text = textElement.innerText || textElement.textContent;

                    ctx.fillText(text, layer.x, currentY);
                    currentY += parseFloat(fontSize); // Move down for the next line
                });
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

    // Add an image layer
    const addImageLayer = (imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            setLayers(prev => [...prev, { type: 'image', content: img, x: 0, y: 0, width: img.width / 2, height: img.height / 2 }]);
        };
    };

    // Add a text layer, change dimensions for different text
    const addTextLayer = () => {
        if (editorText) {
            console.log("Editor HTML content:", editorText);
            setLayers(prev => [...prev, { id: uuidv4(), type: 'text', content: editorText, x: 900, y: 1040, size: 24 }]);
        }
    };

    const loadMoreShapes = () => {
        setVisibleShapes((prevVisibleShapes) => prevVisibleShapes + 4); // Load 4 more shapes on each click
    };

    const loadMoreEmojis = () => {
        setVisibleEmojis((prevVisibleEmojis) => prevVisibleEmojis + 20); // Load 20 more emojis on each click
    };

    const toggleDropdown = (dropdownName) => {
        setActiveDropdown((prev) => (prev === dropdownName ? '' : dropdownName));
    };

    // Handle user input for width and height
    const handleHeightChange = (e) => {
        const value = e.target.value;
        setHeight(parseInt(value, 10));
    };

    const handleWidthChange = (e) => {
        const value = e.target.value;
        setWidth(parseInt(value, 10));
    };

    // Handle background color change
    const handleBackgroundColorChange = (e) => {
        const value = e.target.value;
        setBackgroundColor(value);
    };

    // Handle preset changes (predefined dimensions)
    const handlePresetChange = (presetWidth, presetHeight) => {
        setWidth(presetWidth);
        setHeight(presetHeight);
        setDimensions({ width: presetWidth, height: presetHeight });
    };

    const handleUploadClick = () => {
        fileInputRef.current.click(); // Programmatically click the hidden input
    };

    const handleUploadClickFormat = () => {
        formatInputRef.current.click(); // Programmatically click the hidden input
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            setIsUploading(true); // Set uploading state

            try {
                // Replace this logic with your actual upload logic
                const formData = new FormData();
                formData.append('templateImages', file);

                // Example upload (replace with actual API endpoint)
                const response = await fetch(apis.templateImageUpload, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    setTemplateImages((prevImages) => [...prevImages, result.data]);
                    showMessage(result.message);
                } else {
                    showMessage(result.message, 'error');
                    alert('Image upload failed.');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('An error occurred while uploading the image.');
            }
            setIsUploading(false); // Reset uploading state
        }
    };

    const handleFormatChange = async (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            setIsUploading(true); // Set uploading state

            try {
                // Replace this logic with your actual upload logic
                const formData = new FormData();
                formData.append('templateFormat', file);

                // Example upload (replace with actual API endpoint)
                const response = await fetch(apis.templateFormatUpload, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    setAllTemplates((prevImages) => [...prevImages, result.data]);
                    showMessage(result.message);
                } else {
                    showMessage(result.message, 'error');
                    alert('Template Format upload failed.');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('An error occurred while uploading the image.');
            }
            setIsUploading(false); // Reset uploading state
        }
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('text/plain', item?.templateImages?.url); // Store the image URL
    };

    //DROP IMAGE
    const handleDrop = (e) => {
        e.preventDefault();
        
        // Get the type of the dropped content
        const data = e.dataTransfer.getData('text/plain');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d'); // Ensure you are getting the correct context
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; // Drop X position
        const y = e.clientY - rect.top;   // Drop Y position
    
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
                content: img,
                x: x,
                y: y,
                width: img.width || 64,  // Use a default width if not available
                height: img.height || 64, // Use a default height if not available
            };

            // Update layers and history for SVG
            setLayers((prevLayers) => {
                const newLayers = [...prevLayers, newLayer];
                setHistory((prevHistory) => {
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
                    content: img,
                    x: centeredX, 
                    y: centeredY,
                    width: imgWidth,
                    height: imgHeight,
                };
    
                setLayers((prevLayers) => {
                    const newLayers = [...prevLayers, newLayer];
    
                    setActiveLayerIndex(newLayers.length - 1);
                    setHistory((prevHistory) => {
                        const newHistory = [...prevHistory, newLayers];
                        setCurrentHistoryIndex(newHistory.length - 1);
                        return newHistory;
                    });
    
                    return newLayers;
                });
                drawCanvas(ctx, canvas);
                extractFontsFromImage(img);
            };
        }
    };
    
    const handleDragStartShape = (e, shape) => {
        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        if (shape && shape.svg) {
            const shapeProps = shape.svg.props; // Accessing the props of the React element

            Object.keys(shapeProps).forEach((key) => {
                if (key !== 'children') {
                    tempSvg.setAttribute(key, shapeProps[key]);
                }
            });

            if (shapeProps.children) {
                React.Children.forEach(shapeProps.children, (child) => {
                    const childElement = document.createElementNS('http://www.w3.org/2000/svg', child.type);
                    Object.keys(child.props).forEach((key) => {
                        childElement.setAttribute(key, child.props[key]);
                    });

                    tempSvg.appendChild(childElement);
                });
            }
        } else {
            console.error("Shape or shape.svg is undefined");
        }

        const svgString = new XMLSerializer().serializeToString(tempSvg);
        e.dataTransfer.setData('text/plain', svgString);
    };

    const handleDragStartEmoji = (e, emoji) => {
        e.dataTransfer.setData('text/plain', emoji);
    };

    const handleDropForShapesAndEmojis = (e) => {
        e.preventDefault();

        const type = e.dataTransfer.getData('type');
        const canvas = canvasRef.current;
        const ctx = context;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        console.log("type ; ", type);

        if (type === 'svg') {
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            console.log("url:", url);

            const img = new Image();
            img.onload = () => {
                const width = Math.abs(x - startX); // Optionally calculate size based on clicks
                const height = Math.abs(y - startY); // Optionally calculate size based on clicks
                ctx.drawImage(img, Math.min(startX, x), Math.min(startY, y), width || img.width, height || img.height);
                URL.revokeObjectURL(url); // Clean up the object URL
            };
            img.src = url;
        } else if (type === 'emoji') {
            const emoji = e.dataTransfer.getData('text/plain');
            // Set font size and text alignment for emojis
            ctx.font = '100px serif'; // Set font size and family
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw the emoji text at the drop position
            ctx.fillText(emoji, x, y);
        }
    };

    const handleClear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = 'white'; // Set background color
        ctx.fillRect(0, 0, width, height); // Clear the canvas
        setLayers([]); // Reset layers
        setHistory([]); // Clear history for undo/redo
        setCurrentHistoryIndex(-1); // Reset history index
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

    const handleSaveAndSend = async () => {
        if (!templateName) {
            alert('Template name is required to proceed.');
            return;
        }

        // Generate SVG from Canvas
        const svgData = generateSVGFromCanvas();
        console.log("svgData : ", svgData);

        // Convert the SVG string to a Blob
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const formData = new FormData();
        formData.append('name', templateName);
        formData.append('template', blob, `${templateName}.svg`);

        try {
            const response = await fetch(apis.createTemplate, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const newTemplate = await response.json();
            if (response.ok) {
                console.log("newTemplate:", newTemplate);
                setAllTemplates((prevTemplates) => [...prevTemplates, newTemplate.data]);
                showMessage('Template uploaded successfully!');
            } else {
                showMessage(newTemplate.message, 'error');
            }
            closeDownloadModal();
        } catch (error) {
            console.error('Error uploading template:', error);
            showMessage('Error uploading template', 'error');
        }
    };

    const openDownloadModal = () => setIsDownloadModalOpen(true);
    const closeDownloadModal = () => setIsDownloadModalOpen(false);

    const moveLayerUp = (index) => {
        if (index === 0) return;
        const newLayers = [...layers];
        const [movedLayer] = newLayers.splice(index, 1);
        newLayers.splice(index - 1, 0, movedLayer);
        setLayers(newLayers);
    };

    const moveLayerDown = (index) => {
        if (index === layers.length - 1) return;
        const newLayers = [...layers];
        const [movedLayer] = newLayers.splice(index, 1);
        newLayers.splice(index + 1, 0, movedLayer);
        setLayers(newLayers);
    };

    const handleDeleteLayer = (layerToDelete) => {
        const updatedLayers = layers.filter((layer) => layer !== layerToDelete);
        setLayers(updatedLayers);
    };

    const downloadSampleTemplate = () => {
        const canvas = canvasRef.current;

        // Convert canvas to PNG and download it
        const dataURL = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${templateName}.jpeg`; // Use the entered template name as the file name
        link.click();
    };

    const generateSVGFromCanvas = () => {
        const canvas = canvasRef.current;

        // 1. Get the current canvas as a base64 image (PNG format)
        const dataURL = canvas.toDataURL("image/png");

        // 2. Create an SVG document embedding the image
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                <image href="${dataURL}" width="${canvas.width}" height="${canvas.height}" />
            </svg>
        `;

        return svgContent; // This is the SVG as a string
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination || source.index === destination.index) return; // Exit if dropped outside or if position didn't change

        const reorderedLayers = Array.from(layers);
        const [removed] = reorderedLayers.splice(source.index, 1); // Remove the dragged item
        reorderedLayers.splice(destination.index, 0, removed); // Insert at the new location

        setLayers(reorderedLayers); // Update the layers state
    };

    const extractFontsFromImage = (img) => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set the canvas size to the image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

        // Use Tesseract.js to recognize text from the canvas
        Tesseract.recognize(
            canvas.toDataURL(), // Use the canvas data URL
            'eng', // Language
        ).then(({ data: { text, symbols } }) => {
            console.log('Extracted Text:', text);

            // Log detected symbols, which may contain font information
            symbols.forEach((symbol) => {
                console.log(`Symbol: ${symbol.text}, Font: ${symbol.fontName || 'unknown'}`); // Font detection is limited
            });
        }).catch((error) => {
            console.error('Error during OCR:', error);
        });
    };

    return (
        <div className="main-container">
            <div className="relative flex h-full gap-3 sm:h-[calc(100vh_-_150px)]">

                {/* Left Panel with Dropdown */}
                {/* <div className="panel mb-3 w-[240px] "> Explicit width control sm:w-[180px] lg:w-[200px] */}
                <div className="panel mb-3 w-[260px] ">
                    <div className="grid grid-cols-1 gap-4">

                        {/* ALL 6 DROPDOWNS */}
                        {(activeDropdown === '' || activeDropdown === 'canvas') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className="btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center"
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
                                        <div className="mb-5">
                                            <label className="block mb-2">Background Color:</label> {/* Added margin to separate the label */}
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={handleBackgroundColorChange}
                                                className="form-input h-10 p-0.5 border border-gray-300 rounded-md"
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
                                                Selected dimensions: {dimensions.width} x {dimensions.height} px
                                            </div>
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        )}

                        {(activeDropdown === '' || activeDropdown === 'upload') && (
                            <div className="relative">
                                {/* Dropdown button */}
                                <button
                                    type="button"
                                    className={`btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center`}
                                    onClick={() => toggleDropdown('upload')}
                                >
                                    Upload Image
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'upload' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>

                                {/* Dropdown content */}
                                <AnimateHeight duration={300} height={activeDropdown === 'upload' ? 'auto' : 0}>
                                    <div className="p-4">
                                        {/* Action buttons */}
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <div>
                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef} // Reference to input
                                                    onChange={handleFileChange} // Handle file change
                                                    className="hidden" // Hide the default file input
                                                />
                                                {/* Button to trigger the hidden file input */}
                                                <button
                                                    type="button"
                                                    className="btn btn-success bg-green-500 text-white hover:bg-green-600 rounded-md px-4 py-2"
                                                    onClick={handleUploadClick} // Trigger file input click
                                                >
                                                    <IconSend className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                    {isUploading ? 'Uploading...' : 'Upload Image'}
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

                                        {/* Tabbed content */}
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
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'border-b-2 border-secondary text-secondary' : ''
                                                                    } flex-1 py-2 text-center text-gray-700 hover:text-secondary transition-colors`}
                                                            >
                                                                Videos
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>

                                                <Tab.Panels className="mt-4">
                                                    <Tab.Panel>
                                                        <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                                                            {Array.isArray(templateImages) && templateImages.length > 0 ? (
                                                                templateImages.map((item, index) => (
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

                                                    <Tab.Panel>
                                                        <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto"> {/* Adjust height for scroll */}
                                                            {/* Thumbnails for videos */}
                                                            {Array.isArray(templateVideos) && templateVideos.length > 0 ? (
                                                                templateVideos?.map((item, index) => (
                                                                    <div key={item._id} className="border rounded overflow-hidden">
                                                                        <video controls className="w-full h-20 object-cover rounded">
                                                                            <source src={item.templateVideos.url}
                                                                                type="video/mp4" />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-center justify-center items-center">No Videos available</p> // Message for no images
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

                        {(activeDropdown === '' || activeDropdown === 'choose') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className={`btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center`}
                                    onClick={() => toggleDropdown('choose')}
                                >
                                    Choose Template
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'choose' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>
                                <div>
                                    <AnimateHeight duration={300} height={activeDropdown === 'choose' ? 'auto' : 0}>
                                        <br />
                                        <div className="mt-4">
                                            <Tab.Group>
                                                <Tab.List className="flex w-full border-b border-gray-200">
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'border-b-2 border-secondary text-secondary' : ''
                                                                    } flex-1 py-2 text-center text-gray-700 hover:text-secondary transition-colors`}
                                                            >
                                                                Template Library
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>

                                                <Tab.Panels className="mt-4">
                                                    <Tab.Panel as={Fragment}>
                                                        {allTemplates && allTemplates.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-2 scrollable"> {/* Added scrollable class for scrolling */}
                                                                {/* Thumbnails for images */}
                                                                {allTemplates.map((item, index) => (
                                                                    <div key={item._id} className="border rounded overflow-hidden">
                                                                        <img
                                                                            src={item.templateFormat?.url} // Using the image URL from the `template` object
                                                                            alt={`Thumbnail ${index + 1}`}
                                                                            className="w-full max-h-25 object-cover rounded"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-600">No templates available</p> // Display message if array is empty
                                                        )}
                                                    </Tab.Panel>
                                                </Tab.Panels>
                                            </Tab.Group>
                                        </div>
                                        <br />
                                        {/* Upload Template Button */}
                                        <div className="flex justify-center">
                                            <div>
                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={formatInputRef} // Reference to input
                                                    onChange={handleFormatChange} // Handle file change
                                                    className="hidden" // Hide the default file input
                                                />
                                                {/* Button to trigger the hidden file input */}
                                                <button
                                                    type="button"
                                                    className="btn items-center bg-gray-200 text-black hover:bg-gray-400 rounded-md px-4 py-2"
                                                    onClick={handleUploadClickFormat} // Open modal on click
                                                >
                                                    Upload Template
                                                </button>
                                            </div>
                                        </div>
                                    </AnimateHeight>

                                </div>
                            </div>
                        )}

                        {(activeDropdown === '' || activeDropdown === 'typography') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className={`btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center`}
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
                                        <div className="items-center">
                                            <Head>
                                                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Montserrat:wght@400;500;700&family=Open+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
                                            </Head>

                                            {/* Custom Editor */}
                                            <CustomEditor onChange={(text) => setEditorText(text)} />
                                            <br />

                                            {/* Add Text Button */}
                                            <button type="button" className="btn btn-success flex-1 items-center" onClick={addTextLayer}>
                                                Add Text
                                            </button>
                                        </div>
                                    </AnimateHeight>
                                </div>
                            </div>
                        )}

                        {(activeDropdown === '' || activeDropdown === 'shapes') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className={`btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center`}
                                    onClick={() => toggleDropdown('shapes')}
                                >
                                    Shapes
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'shapes' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>
                                <div>
                                    <AnimateHeight duration={300} height={activeDropdown === 'shapes' ? 'auto' : 0}>
                                        {/* <ul className="mt-2 bg-white rounded shadow-md"> */}
                                        <br />
                                        <div className="mt-4">
                                            <Tab.Group>
                                                <Tab.List className="flex w-full border-b border-gray-200">
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'border-b-2 border-secondary text-secondary' : ''
                                                                    } flex-1 py-2 text-center text-gray-700 hover:text-secondary transition-colors`}
                                                            >
                                                                Default Shapes
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'border-b-2 border-secondary text-secondary' : ''
                                                                    } flex-1 py-2 text-center text-gray-700 hover:text-secondary transition-colors`}
                                                            >
                                                                Emojis
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>

                                                <Tab.Panels className="mt-4">
                                                    {/* Shapes Panel */}
                                                    <Tab.Panel>
                                                        <div
                                                            className="grid grid-cols-2 gap-4 overflow-auto"
                                                            style={{ maxHeight: '300px', overflowY: 'auto' }} // Added overflowY style
                                                        >
                                                            {shapes.slice(0, visibleShapes).map((shape, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="border p-2 rounded overflow-hidden flex items-center justify-center"
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStartShape(e, shape)} // Drag Start for Shapes
                                                                >
                                                                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                                                                        {shape.svg}
                                                                    </svg>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Conditionally render Load More button for Shapes */}
                                                        {visibleShapes < shapes.length && (
                                                            <div className="mt-4 flex justify-center">
                                                                <button
                                                                    onClick={loadMoreShapes}
                                                                    className="px-4 py-2 bg-gray-200 text-black hover:bg-gray-400 rounded-md"
                                                                >
                                                                    Load More
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Tab.Panel>

                                                    {/* Emojis Panel */}
                                                    <Tab.Panel>
                                                        <div
                                                            className="grid grid-cols-5 gap-4 overflow-auto"
                                                            style={{ maxHeight: '300px', overflowY: 'auto' }} // Added overflowY style
                                                        >
                                                            {emojis.slice(0, visibleEmojis).map((emoji, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="text-4xl flex items-center justify-center"
                                                                    draggable
                                                                    onDragStart={(e) => handleDragStartEmoji(e, emoji)} // Drag Start for Emojis
                                                                >
                                                                    {emoji}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Conditionally render Load More button for Emojis */}
                                                        {visibleEmojis < emojis.length && (
                                                            <div className="mt-4 flex justify-center">
                                                                <button
                                                                    onClick={loadMoreEmojis}
                                                                    className="px-4 py-2 bg-gray-200 text-black hover:bg-gray-400 rounded-md"
                                                                >
                                                                    Load More
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Tab.Panel>
                                                </Tab.Panels>
                                            </Tab.Group>
                                        </div>
                                        {/* </ul> */}
                                    </AnimateHeight>
                                </div>
                            </div>
                        )}

                        {(activeDropdown === '' || activeDropdown === 'qrcode') && (
                            <div className="relative">
                                <button
                                    type="button"
                                    className={`btn dropdown-toggle w-full bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 text-gray-800 font-medium py-2 px-4 flex justify-between items-center`}
                                    onClick={() => toggleDropdown('qrcode')}
                                >
                                    QR Code
                                    <span className={`inline-block transition-transform duration-300 ${activeDropdown === 'qrcode' ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </span>
                                </button>
                                <div>
                                    <AnimateHeight duration={300} height={activeDropdown === 'qrcode' ? 'auto' : 0}>
                                        {/* <ul className="mt-2 bg-white rounded shadow-md"> */}
                                        <br />
                                        <div className="mb-5">
                                            <div className="flex">
                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                    Height
                                                </div>
                                                <input type="number" placeholder="px" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <div className="flex">
                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                    Width
                                                </div>
                                                <input type="number" placeholder="px" className="form-input ltr:rounded-l-none rtl:rounded-r-none" />
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <div className="flex">
                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                    Background
                                                </div>
                                                <input
                                                    type="color"
                                                    className="form-input h-[40px] w-full ltr:rounded-l-none rtl:rounded-r-none border border-white-light dark:border-[#17263c]"
                                                />
                                            </div>
                                        </div>
                                        {/* </ul> */}
                                    </AnimateHeight>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Panel - Main Content */}
                <div className="panel flex-1">
                    {/* Button section */}
                    <div className="flex flex-wrap mb-4 gap-2">
                        <button type="button" className="btn btn-outline-primary" onClick={handleClear}>
                            <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Clear
                        </button>
                        <button type="button" className="btn btn-outline-warning" onClick={handleUndo}>
                            <IconArrowBackward className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Undo
                        </button>
                        <button type="button" className="btn btn-outline-success" onClick={handleRedo}>
                            <IconArrowForward className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Redo
                        </button>
                    </div>

                    {/* Canvas section */}
                    <div className="flex items-center justify-center w-full h-auto">
                        <div className="relative w-[450px] max-w-full h-[450px]">
                            <canvas
                                ref={canvasRef}
                                width={width}
                                height={height}
                                className="border border-gray-400"
                                onDrop={(e) => {
                                    const type = e.dataTransfer.getData('type');
                                    if (type === 'svg' || type === 'emoji') {
                                        handleDropForShapesAndEmojis(e); // Handle the shapes and emojis drop
                                    } else {
                                        handleDrop(e); // Handle images drop
                                    }
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
                    {/* Consistent width for the panel with padding and shadow */}
                    <div className="flex items-center justify-between gap-2 w-full mb-3">
                        <button
                            type="button"
                            className="btn btn-secondary flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 transition"
                            onClick={downloadSampleTemplate}
                        >
                            <IconDownload className="shrink-0" />
                            Download
                        </button>

                        <button
                            type="button"
                            className="btn btn-success flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                            onClick={openDownloadModal}
                        >
                            <IconSave className="shrink-0" />
                            Save
                        </button>
                    </div>
                    <div className="flex items-center mb-3">
                        Layers
                    </div>

                    {/* Buttons for layer actions */}
                    <div className="flex items-center justify-between w-full mb-3">
                        <div className="dropdown shrink-0 block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                            <button>
                                <IconCopy />
                            </button>
                        </div>
                        <div className="dropdown shrink-0 block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                            <button>
                                <IconEye />
                            </button>
                        </div>
                        <div className="dropdown shrink-0 block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                            <button onClick={() => addImageLayer('https://yt3.googleusercontent.com/viNp17XpEF-AwWwOZSj_TvgobO1CGmUUgcTtQoAG40YaYctYMoUqaRup0rTxxxfQvWw3MvhXesw=s900-c-k-c0x00ffffff-no-rj')}>
                                <IconPlus />
                            </button>
                        </div>
                        <div className="dropdown shrink-0 block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                            <button>
                                <IconLink />
                            </button>
                        </div>
                        <div className="dropdown shrink-0 block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                            <button onClick={() => handleDeleteLayer(selectedLayer)}>
                                <IconTrashLines />
                            </button>
                        </div>
                    </div>

                    {/* Display the list of layers */}
                    <div className="bg-white p-2 rounded-md shadow-md">
                        {layers.length > 0 ? (
                            <ul className="divide-y divide-gray-300" style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Set a max height */}
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="layers">
                                        {(provided) => (
                                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                                {layers.map((layer, index) => (
                                                    <Draggable key={layer.id} draggableId={layer.id} index={index}>
                                                        {(provided) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`flex items-center justify-between p-2 cursor-pointer ${selectedLayer === layer ? 'bg-blue-100' : ''
                                                                    }`}
                                                                onClick={() => setSelectedLayer(layer)}
                                                            >
                                                                <span>
                                                                    {layer.type === 'image' ? `Image ${index + 1}` : `Text ${index + 1}`}
                                                                </span>

                                                                <div className="flex space-x-2">
                                                                    <button onClick={() => moveLayerUp(index)} className="text-gray-600 hover:text-gray-900">
                                                                        <IconArrowForward />
                                                                    </button>
                                                                    <button onClick={() => moveLayerDown(index)} className="text-gray-600 hover:text-gray-900">
                                                                        <IconArrowBackward />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteLayer(layer)} className="text-red-600 hover:text-red-900">
                                                                        <IconTrashLines />
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center">No layers available</p>
                        )}
                    </div>
                </div>

                {isDownloadModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Enter Template Name</h2>
                            <input
                                type="text"
                                className="form-input w-full border border-gray-300 p-2 rounded-md mb-4"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Template name"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                                    onClick={closeDownloadModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={handleSaveAndSend}
                                >
                                    Save
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
