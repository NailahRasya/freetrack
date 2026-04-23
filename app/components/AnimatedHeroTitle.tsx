"use client";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const words = [
  { text: "Bekerja", type: "normal" },
  { text: "dengan", type: "normal" },
  { text: "Kepastian,", type: "emerald" },
  { text: "br", type: "br" },
  { text: "Dibayar", type: "normal" },
  { text: "dengan", type: "normal" },
  { text: "Transparansi.", type: "blue" }
];

export default function AnimatedHeroTitle() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    const runAnimation = async () => {
      // Reset instantly before starting
      controls.set({ opacity: 0, y: 40, filter: "blur(0px)" });

      // Staggered fade in
      await controls.start((i) => ({
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          delay: i * 0.2,
          duration: 0.5,
          ease: "easeOut",
        },
      }));
    };

    runAnimation();

    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [controls]);

  return (
    <h1 className="hero-title" style={{ position: "relative", zIndex: 10 }}>
      {words.map((word, index) => {
        if (word.type === "br") return <br key={`br-${index}`} />;

        const isHovered = hoveredIndex === index;
        const isOthersHovered = hoveredIndex !== null && hoveredIndex !== index;

        // Determine class based on type
        let className = "";
        if (word.type === "emerald") className = "gradient-text-emerald animated-gradient";
        if (word.type === "blue") className = "gradient-text animated-gradient";

        return (
          <motion.span
            key={index}
            custom={index}
            animate={controls}
            initial={{ opacity: 0, y: 40 }}
            style={{ 
              display: "inline-block", 
              marginRight: "0.28em", 
              willChange: "transform, opacity, filter" 
            }}
          >
            <motion.span
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                opacity: isOthersHovered ? 0.6 : 1,
                scale: isHovered ? 1.08 : 1,
                filter: isHovered
                  ? "brightness(1.15) drop-shadow(0px 0px 12px rgba(255,255,255,0.25))"
                  : "brightness(1) drop-shadow(0px 0px 0px rgba(255,255,255,0))",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                display: "inline-block",
                cursor: "pointer",
                originX: 0.5,
                originY: 0.5,
              }}
              className={className}
            >
              {word.text}
            </motion.span>
          </motion.span>
        );
      })}
    </h1>
  );
}
