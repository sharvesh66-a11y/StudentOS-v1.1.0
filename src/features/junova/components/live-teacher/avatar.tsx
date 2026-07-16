'use client';

/**
 * StudentOS Junova AI — Animated Avatar
 *
 * CSS-based animated avatar with:
 * - Eyes (with pupils that track cursor for eye-contact)
 * - Mouth (animates during speech via lip-sync)
 * - Facial expressions (neutral, happy, focused, thinking, encouraging, surprised, speaking)
 * - Idle animations (blinking, breathing)
 * - Hand gestures (wave, point, think)
 *
 * No external 3D library — pure CSS + React state.
 *
 * @see src/features/junova/hooks/use-live-teacher.ts
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { AvatarExpression, AvatarStyle, LiveSessionSettings } from '../../types';

export interface AvatarProps {
  expression: AvatarExpression;
  isSpeaking?: boolean;
  settings?: LiveSessionSettings | null;
  teacherName?: string;
  themeColor?: string;
  className?: string;
}

export function Avatar({
  expression,
  isSpeaking = false,
  settings,
  teacherName,
  themeColor = '#7c3aed',
  className,
}: AvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [mouthOpen, setMouthOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avatarStyle: AvatarStyle = settings?.avatarStyle ?? 'friendly';
  const expressionIntensity = (settings?.expressionIntensity ?? 70) / 100;
  const animationSpeed = settings?.animationSpeed ?? 1.0;
  const eyeContactEnabled = settings?.eyeContactEnabled ?? true;
  const gesturesEnabled = settings?.gesturesEnabled ?? true;

  // Random blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      blinkTimerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Lip-sync — toggle mouth open/close rapidly while speaking
  useEffect(() => {
    if (!isSpeaking) return;

    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 120 / animationSpeed);

    return () => clearInterval(interval);
  }, [isSpeaking, animationSpeed]);

  // Reset mouth when not speaking (derived from isSpeaking, not a setState-in-effect)
  const effectiveMouthOpen = isSpeaking ? mouthOpen : false;

  // Eye tracking — pupils follow cursor for eye contact
  useEffect(() => {
    if (!eyeContactEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxOffset = 4;
      const angle = Math.atan2(dy, dx);
      const offset = Math.min(distance / 100, maxOffset);
      setPupilOffset({
        x: Math.cos(angle) * offset,
        y: Math.sin(angle) * offset,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeContactEnabled]);

  // Expression-based mouth shape
  const mouthShape = (() => {
    if (isSpeaking) return effectiveMouthOpen ? 'speaking-open' : 'speaking-closed';
    switch (expression) {
      case 'happy':
      case 'encouraging':
        return 'smile';
      case 'focused':
        return 'neutral';
      case 'thinking':
        return 'flat';
      case 'surprised':
        return 'open';
      default:
        return 'neutral';
    }
  })();

  // Expression-based eye shape
  const eyeShape = (() => {
    if (isBlinking) return 'blinking';
    switch (expression) {
      case 'happy':
        return 'happy';
      case 'focused':
        return 'focused';
      case 'thinking':
        return 'looking-up';
      case 'surprised':
        return 'wide';
      default:
        return 'normal';
    }
  })();

  const containerStyle: CSSProperties = {
    '--avatar-color': themeColor,
    '--animation-speed': `${animationSpeed}`,
    '--expression-intensity': `${expressionIntensity}`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center',
        avatarStyle === 'minimal' && 'avatar-minimal',
        avatarStyle === 'geometric' && 'avatar-geometric',
        avatarStyle === 'friendly' && 'avatar-friendly',
        className,
      )}
      style={containerStyle}
      role="img"
      aria-label={`${teacherName ?? 'AI Teacher'} avatar — ${expression}`}
    >
      {/* Head */}
      <div
        className={cn(
          'relative rounded-[40%] border-2 transition-all duration-300',
          'bg-gradient-to-b from-[var(--avatar-color)]/20 to-[var(--avatar-color)]/5',
        )}
        style={{
          width: '120px',
          height: '140px',
          borderColor: 'var(--avatar-color)',
          animation: `avatar-breathe ${3 / animationSpeed}s ease-in-out infinite`,
        }}
      >
        {/* Eyes */}
        <div className="absolute right-0 left-0 flex justify-center gap-6" style={{ top: '40px' }}>
          {/* Left eye */}
          <div
            className={cn(
              'relative h-6 w-8 overflow-hidden rounded-full transition-all',
              eyeShape === 'blinking' && 'h-0.5',
              eyeShape === 'happy' && 'h-2',
              eyeShape === 'wide' && 'h-8 w-9',
            )}
            style={{ backgroundColor: 'white', border: '1px solid var(--avatar-color)' }}
          >
            <div
              className="absolute h-3 w-3 rounded-full transition-all"
              style={{
                backgroundColor: 'var(--avatar-color)',
                left: `calc(50% - 6px + ${pupilOffset.x}px)`,
                top: `calc(50% - 6px + ${pupilOffset.y}px)`,
              }}
            />
          </div>

          {/* Right eye */}
          <div
            className={cn(
              'relative h-6 w-8 overflow-hidden rounded-full transition-all',
              eyeShape === 'blinking' && 'h-0.5',
              eyeShape === 'happy' && 'h-2',
              eyeShape === 'wide' && 'h-8 w-9',
            )}
            style={{ backgroundColor: 'white', border: '1px solid var(--avatar-color)' }}
          >
            <div
              className="absolute h-3 w-3 rounded-full transition-all"
              style={{
                backgroundColor: 'var(--avatar-color)',
                left: `calc(50% - 6px + ${pupilOffset.x}px)`,
                top: `calc(50% - 6px + ${pupilOffset.y}px)`,
              }}
            />
          </div>
        </div>

        {/* Mouth */}
        <div className="absolute right-0 left-0 flex justify-center" style={{ top: '85px' }}>
          <div
            className={cn(
              'transition-all duration-100',
              mouthShape === 'smile' && 'h-2 w-8 rounded-b-full',
              mouthShape === 'neutral' && 'h-1 w-6 rounded-full',
              mouthShape === 'flat' && 'h-0.5 w-5',
              mouthShape === 'open' && 'h-5 w-5 rounded-full',
              mouthShape === 'speaking-open' && 'h-3 w-4 rounded-full',
              mouthShape === 'speaking-closed' && 'h-1 w-3 rounded-full',
            )}
            style={{
              backgroundColor: 'var(--avatar-color)',
              opacity: 0.8,
            }}
          />
        </div>

        {/* Expression: thinking eyebrow */}
        {expression === 'thinking' && (
          <div
            className="absolute h-0.5 w-6 rounded-full"
            style={{
              top: '32px',
              right: '28px',
              backgroundColor: 'var(--avatar-color)',
              transform: 'rotate(-15deg)',
            }}
          />
        )}

        {/* Expression: focused eyebrows */}
        {expression === 'focused' && (
          <>
            <div
              className="absolute h-0.5 w-7 rounded-full"
              style={{
                top: '34px',
                left: '24px',
                backgroundColor: 'var(--avatar-color)',
                transform: 'rotate(10deg)',
              }}
            />
            <div
              className="absolute h-0.5 w-7 rounded-full"
              style={{
                top: '34px',
                right: '24px',
                backgroundColor: 'var(--avatar-color)',
                transform: 'rotate(-10deg)',
              }}
            />
          </>
        )}
      </div>

      {/* Hand gestures */}
      {gesturesEnabled && (expression === 'happy' || expression === 'encouraging') && (
        <>
          {/* Left hand */}
          <div
            className="absolute h-4 w-4 rounded-full"
            style={{
              left: '10px',
              bottom: '20px',
              backgroundColor: 'var(--avatar-color)',
              opacity: 0.6,
              animation: `wave-left ${1 / animationSpeed}s ease-in-out infinite`,
            }}
          />
          {/* Right hand */}
          <div
            className="absolute h-4 w-4 rounded-full"
            style={{
              right: '10px',
              bottom: '20px',
              backgroundColor: 'var(--avatar-color)',
              opacity: 0.6,
              animation: `wave-right ${1 / animationSpeed}s ease-in-out infinite`,
            }}
          />
        </>
      )}

      {/* Speaking indicator ring */}
      {isSpeaking && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid var(--avatar-color)',
            opacity: 0.3,
            animation: `pulse-ring ${1.5 / animationSpeed}s ease-out infinite`,
          }}
        />
      )}

      {/* Expression label */}
      {teacherName && (
        <div className="text-muted-foreground absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
          {teacherName} · {expression}
        </div>
      )}
    </div>
  );
}
