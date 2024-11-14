"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

const GRID_SIZE = 8

type ShapeType = 'circle' | 'polygon' | 'fan-to-circle' | 'square-trace'

interface AnimationProps {
  id: number
  type: ShapeType
  x: number
  y: number
  color: string
  size: number
}

const colors = ['#ffcccb', '#add8e6', '#90ee90', '#ffc0cb']

export default function Component() {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const [animations, setAnimations] = useState<AnimationProps[]>([])
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 })
  const [isPaused, setIsPaused] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMusicOn, setIsMusicOn] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array(GRID_SIZE * GRID_SIZE).fill(null))

  useEffect(() => {
    const updateGridDimensions = () => {
      if (gridRef.current) {
        const { width, height } = gridRef.current.getBoundingClientRect()
        setGridDimensions({ width, height })
      }
    }

    updateGridDimensions()
    window.addEventListener('resize', updateGridDimensions)
    return () => window.removeEventListener('resize', updateGridDimensions)
  }, [])

  const createRandomAnimation = useCallback((): AnimationProps => {
    const size = Math.random() * (Math.min(gridDimensions.width, gridDimensions.height) / 4) + 
                 Math.min(gridDimensions.width, gridDimensions.height) / 8
    const types: ShapeType[] = ['circle', 'polygon', 'fan-to-circle', 'square-trace']
    return {
      id: Math.random(),
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * gridDimensions.width,
      y: Math.random() * gridDimensions.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: size
    }
  }, [gridDimensions])

  const triggerRandomAnimations = useCallback(() => {
    if (isPaused) return
    const animationCount = Math.floor(Math.random() * 5) + 1 // Generate 1 to 5 animations
    const newAnimations = Array.from({ length: animationCount }, createRandomAnimation)
    setAnimations(newAnimations)
    setTimeout(() => setAnimations([]), 1500)
  }, [createRandomAnimation, isPaused])

  const handleCellHover = useCallback((index: number) => {
    if (isPaused) return
    setHoveredCell(index)
    triggerRandomAnimations()
    
    if (isMusicOn) {
      const audioElement = audioRefs.current[index]
      if (audioElement) {
        audioElement.currentTime = 0
        audioElement.play().catch(e => console.error(`Audio playback failed for cell ${index}:`, e))
      }
    }
  }, [triggerRandomAnimations, isPaused, isMusicOn])

  const renderAnimation = (animation: AnimationProps) => {
    switch (animation.type) {
      case 'circle':
        return (
          <motion.div
            key={animation.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, times: [0, 0.7, 1], ease: "easeInOut" }}
            style={{
              position: 'absolute',
              left: animation.x,
              top: animation.y,
              width: animation.size,
              height: animation.size,
              backgroundColor: animation.color,
              borderRadius: '50%',
            }}
          />
        )
      case 'polygon':
        return (
          <motion.div
            key={animation.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 45 }}
            exit={{ opacity: 0, scale: 0, rotate: 0 }}
            transition={{ duration: 0.7, times: [0, 0.7, 1], ease: "easeInOut" }}
            style={{
              position: 'absolute',
              left: animation.x,
              top: animation.y,
              width: animation.size,
              height: animation.size,
              backgroundColor: animation.color,
            }}
          />
        )
      case 'fan-to-circle':
        return (
          <motion.div
            key={animation.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1.5, times: [0, 0.5, 1], ease: "easeInOut" }}
            style={{
              position: 'absolute',
              left: animation.x,
              top: animation.y,
              width: animation.size,
              height: animation.size,
              backgroundColor: animation.color,
              borderRadius: '50%',
              clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)',
            }}
          />
        )
      case 'square-trace':
        return (
          <motion.div
            key={animation.id}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{
              position: 'absolute',
              left: animation.x,
              top: animation.y,
              width: animation.size,
              height: animation.size,
            }}
          >
            <svg width={animation.size} height={animation.size} viewBox="0 0 100 100">
              <motion.path
                d="M 0,0 L 100,0 L 100,100 L 0,100 Z"
                fill="none"
                stroke={animation.color}
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            </svg>
          </motion.div>
        )
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="w-screen h-screen bg-yellow-50 overflow-hidden relative">
      <div 
        ref={gridRef}
        className="w-full h-full grid"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div
            key={index}
            className={`transition-colors duration-200 ${
              hoveredCell === index ? 'bg-[#f5f5dc]' : 'bg-yellow-100'
            }`}
            onMouseEnter={() => handleCellHover(index)}
            onMouseLeave={() => setHoveredCell(null)}
          />
        ))}
        <AnimatePresence>
          {!isPaused && animations.map(renderAnimation)}
        </AnimatePresence>
      </div>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
        <audio 
          key={index} 
          ref={el => audioRefs.current[index] = el} 
          src={`/示例${index + 1}.mp4`}
        />
      ))}
      <Button
        className="absolute top-4 right-4 z-10"
        onClick={togglePause}
        variant="outline"
      >
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>
      {isMenuOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold">菜单</h2>
            <Button className="w-full" onClick={() => setIsMenuOpen(false)}>继续游戏</Button>
            <Button className="w-full">团队成员</Button>
            <div className="flex items-center justify-between">
              <span>背景音乐：</span>
              <Switch
                checked={isMusicOn}
                onCheckedChange={setIsMusicOn}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}