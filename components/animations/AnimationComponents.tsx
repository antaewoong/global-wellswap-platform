import React from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// 스크롤 기반 패럴랙스 효과
export const ParallaxSection = ({ 
  children, 
  speed = 0.5, 
  className = "" 
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 스크롤 트리거 애니메이션 - 폼 안정화를 위해 초기 애니메이션 비활성
export const ScrollTriggerAnimation = ({ 
  children, 
  threshold = 0.1, 
  delay = 0,
  duration = 0.8,
  className = ""
}: {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: true,
    margin: "-50px 0px -50px 0px"
  });
  
  return (
    <motion.div
      ref={ref}
      initial={false} // 폼 섹션에서 포커스 안정화를 위해 초기 애니메이션 비활성
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 텍스트 타이핑 애니메이션 (연속 반복)
export const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0,
  className = "",
  repeat = true,
  pauseAfterComplete = 2000
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  repeat?: boolean;
  pauseAfterComplete?: number;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    // 초기 딜레이 후 타이핑 시작
    const initialDelay = setTimeout(() => {
      setIsTyping(true);
    }, delay);
    
    return () => clearTimeout(initialDelay);
  }, [delay]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    } else {
      // 타이핑 완료 후 반복
      if (repeat) {
        const resetTimer = setTimeout(() => {
          setDisplayText('');
          setCurrentIndex(0);
          setIsTyping(false);
          
          // 잠시 후 다시 시작
          setTimeout(() => {
            setIsTyping(true);
          }, 500);
        }, pauseAfterComplete);
        
        return () => clearTimeout(resetTimer);
      }
    }
  }, [currentIndex, text, speed, isTyping, repeat, pauseAfterComplete]);
  
  return (
    <span className={`${className} inline-flex items-baseline`} style={{ minHeight: '1.2em' }}>
      <span>{displayText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="inline-block w-1 bg-current"
        style={{ 
          height: '0.9em',
          marginLeft: '2px'
        }}
      />
    </span>
  );
};

// 메인 타이틀용 고급 애니메이션 (글자별 등장 + 호버 효과)
export const AnimatedMainTitle = ({ 
  text, 
  className = "",
  delay = 0,
  staggerDelay = 0.1
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) => {
  const letters = text.split('');
  
  return (
    <motion.h1 
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 1.2, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 100, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            delay: delay + (index * staggerDelay),
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{
            scale: 1.1,
            y: -10,
            rotateY: 10,
            transition: { duration: 0.3 }
          }}
          className="inline-block cursor-default"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// 부드러운 그라데이션 배경 애니메이션
export const GradientBackground = ({ 
  children, 
  className = "",
  colors = ["from-zinc-900", "via-zinc-800", "to-zinc-900"]
}: {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}) => {
  return (
    <motion.div
      className={`bg-gradient-to-r ${colors.join(' ')} ${className}`}
      animate={{
        background: [
          `linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)`,
          `linear-gradient(90deg, #27272a 0%, #18181b 50%, #27272a 100%)`,
          `linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)`
        ]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// 부드러운 페이드인 애니메이션
export const FadeInAnimation = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 애니메이션 버튼
export const AnimatedButton = ({ 
  children, 
  onClick, 
  className = "",
  disabled = false,
  style
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        y: 0
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.button>
  );
};

// 애니메이션 카드
export const AnimatedCard = ({ 
  children, 
  className = "",
  delay = 0,
  style
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// 순차 애니메이션 컨테이너
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1,
  className = ""
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 순차 애니메이션 아이템
export const StaggerItem = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 부드러운 헤더
export const SmoothHeader = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 100], [0, -20]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  
  return (
    <motion.nav
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.nav>
  );
};

// 로딩 스피너
export const LoadingSpinner = ({ 
  size = "w-6 h-6",
  className = ""
}) => {
  return (
    <motion.div
      className={`${size} border-2 border-zinc-300 border-t-zinc-900 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// 애니메이션 카운터
export const AnimatedCounter = ({ 
  value, 
  duration = 2,
  suffix = "",
  className = ""
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};
