import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RotateCcw, 
  Download, 
  Share2, 
  Maximize2, 
  Settings,
  Eye,
  Glasses,
  Sun,
  Heart,
  ShoppingCart,
  X,
  Upload,
  Smile,
  Watch,
  Headphones,
  Monitor,
  Volume2
} from 'lucide-react';

import { useAppDispatch } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import '../styles/VirtualTryOn.css';

interface VirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  productType: 'smartwatch' | 'headphones' | 'vr_headset' | 'smart_glasses' | 'earbuds';
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  isOpen,
  onClose,
  product,
  productType
}) => {
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productOverlayRef = useRef<HTMLDivElement>(null);
  
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [facePosition, setFacePosition] = useState<FacePosition>({
    x: 50,
    y: 40,
    width: 200,
    height: 120,
    rotation: 0
  });
  const getInitialPosition = () => {
    switch (productType) {
      case 'smartwatch':
        return { x: 35, y: 65, scale: 0.8, rotation: 0 }; // Wrist position
      case 'headphones':
        return { x: 50, y: 25, scale: 1.2, rotation: 0 }; // Over head
      case 'vr_headset':
        return { x: 50, y: 35, scale: 1.1, rotation: 0 }; // Over eyes/head
      case 'smart_glasses':
        return { x: 50, y: 40, scale: 0.9, rotation: 0 }; // On eyes
      case 'earbuds':
        return { x: 45, y: 35, scale: 0.6, rotation: 0 }; // In ears
      default:
        return { x: 50, y: 45, scale: 1, rotation: 0 };
    }
  };

  const [productPosition, setProductPosition] = useState(getInitialPosition());
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoActive(true);
      }
    } catch (error) {
      toast.error('Camera access denied or not available');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsVideoActive(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setCapturedImage(null);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Download image
  const downloadImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `virtual-tryOn-${product.name}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  // Share image
  const shareImage = async () => {
    if (canvasRef.current && navigator.share) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        const file = new File([blob], `virtual-tryOn-${product.name}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Virtual Try-On: ${product.name}`,
          text: `Check out how I look with ${product.name}!`,
          files: [file]
        });
      } catch (error) {
        toast.error('Sharing not supported on this device');
      }
    } else {
      toast.error('Sharing not supported on this device');
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product._id,
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  // Reset positions
  const resetPositions = () => {
    setProductPosition({
      x: 50,
      y: 45,
      scale: 1,
      rotation: 0
    });
  };

  // Update product overlay position
  useEffect(() => {
    if (productOverlayRef.current) {
      const element = productOverlayRef.current;
      element.style.setProperty('--position-x', `${productPosition.x}%`);
      element.style.setProperty('--position-y', `${productPosition.y}%`);
      element.style.setProperty('--scale', productPosition.scale.toString());
      element.style.setProperty('--rotation', `${productPosition.rotation}deg`);
    }
  }, [productPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const currentImage = capturedImage || uploadedImage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`bg-white rounded-lg overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh] m-4'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                {productType === 'smartwatch' && <Watch className="h-5 w-5 text-purple-600" />}
                {productType === 'headphones' && <Headphones className="h-5 w-5 text-purple-600" />}
                {productType === 'vr_headset' && <Monitor className="h-5 w-5 text-purple-600" />}
                {productType === 'smart_glasses' && <Eye className="h-5 w-5 text-purple-600" />}
                {productType === 'earbuds' && <Volume2 className="h-5 w-5 text-purple-600" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Virtual Try-On</h2>
                <p className="text-sm text-gray-600">{product.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowControls(!showControls)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle controls"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close virtual try-on"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Try-On Area */}
          <div className="flex-1 relative bg-gray-100">
            <div className="relative w-full h-96 lg:h-full overflow-hidden">
              {/* Video Stream */}
              {isVideoActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}

              {/* Captured/Uploaded Image */}
              {currentImage && (
                <img
                  src={currentImage}
                  alt="Try-on preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Product Overlay */}
              {(isVideoActive || currentImage) && (
                <div
                  ref={productOverlayRef}
                  className="product-overlay"
                >
                  <img
                    src={product.images[0]?.url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className={`product-image ${
                      productType === 'smartwatch' ? 'smartwatch' :
                      productType === 'headphones' ? 'headphones' :
                      productType === 'vr_headset' ? 'vr-headset' :
                      productType === 'smart_glasses' ? 'smart-glasses' :
                      productType === 'earbuds' ? 'earbuds' :
                      'default'
                    }`}
                  />
                </div>
              )}

              {/* Placeholder */}
              {!isVideoActive && !currentImage && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Smile className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Try On?</h3>
                    <p className="text-gray-600 mb-4">
                      {productType === 'smartwatch' && 'See how this smartwatch looks on your wrist'}
                      {productType === 'headphones' && 'Experience how these headphones fit on your head'}
                      {productType === 'vr_headset' && 'Visualize this VR headset on your face'}
                      {productType === 'smart_glasses' && 'Try on these smart glasses virtually'}
                      {productType === 'earbuds' && 'See how these earbuds look in your ears'}
                    </p>
                  </div>
                </div>
              )}

              {/* Canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              {!isVideoActive && !currentImage && (
                <>
                  <motion.button
                    type="button"
                    onClick={startCamera}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Start camera"
                  >
                    <Camera className="h-6 w-6" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Upload photo"
                  >
                    <Upload className="h-6 w-6" />
                  </motion.button>
                </>
              )}

              {isVideoActive && (
                <motion.button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Capture photo"
                >
                  <Camera className="h-6 w-6" />
                </motion.button>
              )}

              {currentImage && (
                <>
                  <motion.button
                    type="button"
                    onClick={downloadImage}
                    className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Download image"
                  >
                    <Download className="h-5 w-5" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={shareImage}
                    className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Share image"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Controls Panel */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto"
              >
                {/* Product Info */}
                <div className="mb-6">
                  <img
                    src={product.images[0]?.url || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</p>
                </div>

                {/* Adjustment Controls */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Adjust Fit</h4>
                  
                  {/* Position Controls */}
                  <div>
                    <label htmlFor="horizontal-position" className="block text-sm font-medium text-gray-700 mb-2">
                      Horizontal Position
                    </label>
                    <input
                      id="horizontal-position"
                      type="range"
                      min="20"
                      max="80"
                      value={productPosition.x}
                      onChange={(e) => setProductPosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="Adjust horizontal position of product"
                    />
                  </div>

                  <div>
                    <label htmlFor="vertical-position" className="block text-sm font-medium text-gray-700 mb-2">
                      Vertical Position
                    </label>
                    <input
                      id="vertical-position"
                      type="range"
                      min="20"
                      max="70"
                      value={productPosition.y}
                      onChange={(e) => setProductPosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="Adjust vertical position of product"
                    />
                  </div>

                  <div>
                    <label htmlFor="product-size" className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <input
                      id="product-size"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={productPosition.scale}
                      onChange={(e) => setProductPosition(prev => ({ ...prev, scale: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="Adjust size/scale of product"
                    />
                  </div>

                  <div>
                    <label htmlFor="product-rotation" className="block text-sm font-medium text-gray-700 mb-2">
                      Rotation
                    </label>
                    <input
                      id="product-rotation"
                      type="range"
                      min="-30"
                      max="30"
                      value={productPosition.rotation}
                      onChange={(e) => setProductPosition(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="Adjust rotation angle of product"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetPositions}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Position</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setUploadedImage(null);
                      startCamera();
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Try Again</span>
                  </button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Tips for best results:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure good lighting</li>
                    <li>• Look directly at the camera</li>
                    <li>• Keep your face centered</li>
                    <li>• Remove existing eyewear</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload image for virtual try-on"
        />
      </motion.div>
    </div>
  );
};

export default VirtualTryOn;