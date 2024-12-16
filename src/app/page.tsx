"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants} from "framer-motion";
import { Menu } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const GRID_SIZE = 4;
const CHARACTERS = ["波奇", "虹夏", "喜多", "凉"];
const lightningVariants: Variants = {
  initial: ({ direction }: { direction: string }) => {
    switch (direction) {
      case "left":
        return { x: "-100%", y: "0%" };
      case "right":
        return { x: "100%", y: "0%" };
      case "top":
        return { x: "0%", y: "-100%" };
      case "bottom":
        return { x: "0%", y: "100%" };
      default:
        return { x: "0%", y: "0%" };
    }
  },
  animate: { x: "0%", y: "0%", transition: { duration: 0.5 } },
};


type ShapeType = "circle" | "polygon";

interface AnimationProps {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  color: string;
  size: number;
}

const colors = [
  "rgba(246, 214, 214, 0.7)",
  "rgba(161, 238, 189, 0.7)",
  "rgba(123,211,234, 0.7)",
  "rgba(255, 204, 225, 0.7)",
  "rgba(255, 221, 174, 0.7)",
  "rgba(255, 157, 61, 0.7)",
];
const backgroundColors = [
  "rgba(0,0,139,0.7)",
  "rgba(255,204,225,0.7)",
  "rgba(144,238,144,0.7)",
  "rgba(0,0,0,0.7)",
  "rgba(255,255,255,0.7)",
  "rgba(255,255,224,0.7)",
];

export default function Component() {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [animations, setAnimations] = useState<AnimationProps[]>([]);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] =
    useState(true);
  const [backgroundColor, setBackgroundColor] = useState(backgroundColors[5]);
  const [currentCharacter, setCurrentCharacter] = useState(CHARACTERS[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "top" | "right" | "bottom" | "left"
  >("top");
  const [nextCharacter, setNextCharacter] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(
    Array(GRID_SIZE * GRID_SIZE).fill(null)
  );
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const updateGridDimensions = () => {
      if (gridRef.current) {
        const { width, height } = gridRef.current.getBoundingClientRect();
        setGridDimensions({ width, height });
      }
    };

    updateGridDimensions();
    window.addEventListener("resize", updateGridDimensions);

    const playBackgroundMusic = () => {
      if (backgroundMusicRef.current && isBackgroundMusicPlaying) {
        backgroundMusicRef.current.play().catch((error) => {
          console.error("背景音乐自动播放失败:", error);
        });
      }
    };

    playBackgroundMusic();
    document.addEventListener("click", playBackgroundMusic, { once: true });

    return () => {
      window.removeEventListener("resize", updateGridDimensions);
      document.removeEventListener("click", playBackgroundMusic);
    };
  }, [isBackgroundMusicPlaying]);

  const createRandomAnimation = useCallback((): AnimationProps => {
    const maxSize = Math.min(gridDimensions.width, gridDimensions.height) / 2;
    const size = Math.random() * maxSize + maxSize / 4;
    const types: ShapeType[] = ["circle", "polygon"];
    return {
      id: Math.random(),
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * gridDimensions.width,
      y: Math.random() * gridDimensions.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: size,
    };
  }, [gridDimensions]);

  const triggerRandomAnimations = useCallback(() => {
    const animationCount = Math.floor(Math.random() * 5) + 1;
    const newAnimations = Array.from(
      { length: animationCount },
      createRandomAnimation
    );
    setAnimations(newAnimations);
  }, [createRandomAnimation]);

  const changeBackgroundColor = useCallback(() => {
    if (Math.random() < 1 / 6) {
      let newColor;
      do {
        newColor =
          backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      } while (newColor === backgroundColor);
      setBackgroundColor(newColor);
    }
  }, [backgroundColor]);

  const handleCellHover = useCallback(
    (index: number) => {
      setHoveredCell(index);
      triggerRandomAnimations();
      changeBackgroundColor();

      const audioElement = audioRefs.current[index];
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement
          .play()
          .catch((e) => console.error(`音频播放失败，单元格 ${index}:`, e));
      }
    },
    [triggerRandomAnimations, changeBackgroundColor]
  );

  const renderAnimation = (animation: AnimationProps) => {
    const shape = animation.type === "circle" ? "rounded-full" : "";
    return (
      <motion.div
        key={animation.id}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.5, times: [0, 0.7, 1], ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: animation.x,
          top: animation.y,
          width: animation.size,
          height: animation.size,
          backgroundColor: animation.color,
        }}
        className={shape}
      />
    );
  };

  const toggleBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      if (isBackgroundMusicPlaying) {
        backgroundMusicRef.current.pause();
      } else {
        backgroundMusicRef.current
          .play()
          .catch((e) => console.error("背景音乐播放失败:", e));
      }
      setIsBackgroundMusicPlaying(!isBackgroundMusicPlaying);
    }
  }, [isBackgroundMusicPlaying]);

  const changeCharacter = useCallback((character: string) => {
    setIsMenuOpen(false);
    setNextCharacter(character);
    setIsTransitioning(true);
    setTransitionDirection(
      ["top", "right", "bottom", "left"][Math.floor(Math.random() * 4)] as
        | "top"
        | "right"
        | "bottom"
        | "left"
    );

    setTimeout(() => {
      setCurrentCharacter(character);
      // 更新音频资源
      audioRefs.current.forEach((audioRef, index) => {
        if (audioRef) {
          audioRef.src = `/${character}${index + 1}.wav`;
        }
      });
      setIsTransitioning(false);
      setNextCharacter(null);
    }, 250);
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/${currentCharacter}.jpg)` }}
    >
      <motion.div
        className="w-full h-full absolute"
        animate={{ backgroundColor }}
        style={{ opacity: 0.7 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
      {isTransitioning && nextCharacter && (
        <>
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              backgroundImage: `url(/${nextCharacter}.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            }}
          />
          <motion.div
            className="absolute z-30"
            custom={transitionDirection}
            variants={lightningVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{
              width:
                transitionDirection === "left" ||
                transitionDirection === "right"
                  ? 2
                  : "100%",
              height:
                transitionDirection === "top" ||
                transitionDirection === "bottom"
                  ? 2
                  : "100%",
              backgroundColor: "white",
              boxShadow: "0 0 10px 5px rgba(255, 255, 255, 0.7)",
            }}
          />
        </>
      )}
      <div
        ref={gridRef}
        className="w-full h-full grid relative z-10"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div
            key={index}
            className={`transition-colors duration-200`}
            style={{
              backgroundColor:
                hoveredCell === index
                  ? `color-mix(in srgb, ${backgroundColor} 50%, white)`
                  : "transparent",
            }}
            onMouseEnter={() => handleCellHover(index)}
            onMouseLeave={() => setHoveredCell(null)}
          />
        ))}
        <AnimatePresence>{animations.map(renderAnimation)}</AnimatePresence>
      </div>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
        <audio
          key={index}
          ref={(el) => {
            if (el) audioRefs.current[index] = el;
          }}
          src={`/${currentCharacter}${index + 1}.wav`}
        />
      ))}
      <audio ref={backgroundMusicRef} src="/Mixdown.mp3" loop />
      <Button
        className="absolute top-4 right-4 z-20"
        onClick={() => setIsMenuOpen(true)}
        variant="outline"
      >
        <Menu className="h-4 w-4" />
      </Button>
      {isMenuOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-8 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold">菜单</h2>
            <div className="flex items-center justify-between">
              <span>背景音乐：</span>
              <Switch
                checked={isBackgroundMusicPlaying}
                onCheckedChange={toggleBackgroundMusic}
              />
            </div>
            {CHARACTERS.map((character) => (
              <Button
                key={character}
                className="w-full flex items-center space-x-2"
                onClick={() => changeCharacter(character)}
              >
                <Image
                  src={`/${character}_head.jpg`}
                  alt={`${character} avatar`}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <span>{character}</span>
              </Button>
            ))}
            <Button className="w-full" onClick={() => setIsMenuOpen(false)}>
              关闭菜单
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
