import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeContext from '../../contexts/ThemeContext';
import { DitheringShader } from '../ui/dithering-shader';

const LoadingSpinner = ({ size = 'md', className = '', fullPage = false }) => {
  // Try to use theme context, but provide fallback if not available
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'dark'; // default fallback
  
  const [shaderError, setShaderError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // If fullPage is true, render the enhanced loading screen
  if (fullPage) {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    // Enhanced CSS-based fallback that matches the shader design better
    if (shaderError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" 
             style={{
               background: 'linear-gradient(135deg, #220011 0%, #3d0019 50%, #f97316 100%)',
               backgroundSize: '400% 400%',
               animation: 'gradientShift 8s ease infinite'
             }}>
          <style jsx>{`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          
          {/* Swirl-like animated overlay */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(249, 115, 22, 0.3) 70%)',
              transform: 'scale(1.2)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Centered Text */}
          <motion.span 
            className="pointer-events-none z-10 text-center text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter absolute select-none"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.2
            }}
          >
            Repora
          </motion.span>
          
          {/* Subtle loading indicator */}
          <motion.div
            className="absolute bottom-16 md:bottom-20 w-2 h-2 bg-white rounded-full shadow-lg"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7] 
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Loading text */}
          <motion.div
            className="absolute bottom-8 md:bottom-12 text-white/80 text-sm font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Loading...
          </motion.div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, #220011 0%, #3d0019 50%, #f97316 100%)'
           }}>
        {/* Background Shader with error boundary */}
        <div className="absolute inset-0 w-full h-full">
          <DitheringShader 
            width={screenWidth}
            height={screenHeight}
            shape="swirl"
            type="4x4"
            colorBack="#220011"
            colorFront="#f97316"
            pxSize={4}
            speed={0.9}
            className="absolute inset-0 w-full h-full"
            style={{ width: '100vw', height: '100vh' }}
          />
        </div>
        
        {/* Centered Text */}
        <motion.span 
          className="pointer-events-none z-10 text-center text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter absolute select-none"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.2
          }}
        >
          Repora
        </motion.span>
        
        {/* Subtle loading indicator */}
        <motion.div
          className="absolute bottom-16 md:bottom-20 w-2 h-2 bg-white rounded-full shadow-lg"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Loading text */}
        <motion.div
          className="absolute bottom-8 md:bottom-12 text-white/80 text-sm font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  // Regular loading spinner for inline use
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 rounded-full ${
          theme === 'dark'
            ? 'border-gray-700 border-t-orange-500'
            : 'border-gray-300 border-t-orange-500'
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

export default LoadingSpinner;






