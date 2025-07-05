import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { useTheme } from './ThemeProvider';

export default function BackgroundAnimation() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {theme === 'child' ? (
        <>
          {/* Child-friendly animations */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
            <Player
              autoplay
              loop
              src="https://assets5.lottiefiles.com/packages/lf20_jhlaooj5.json"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20">
            <Player
              autoplay
              loop
              src="https://assets5.lottiefiles.com/packages/lf20_yd8fbnml.json"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          {/* Floating bubbles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-blue-300/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Gradient overlay for child theme */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 via-blue-500/20 to-blue-600/30" />
        </>
      ) : (
        <>
          {/* Default theme animations */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Player
              autoplay
              loop
              src="https://assets3.lottiefiles.com/packages/lf20_uwR49r.json"
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>

          {/* Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
        </>
      )}
    </div>
  );
}