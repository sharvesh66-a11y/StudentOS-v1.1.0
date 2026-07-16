import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StudentOS — AI Operating System for Students';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a14 0%, #1a1030 50%, #0a0a14 100%)',
        position: 'relative',
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.25), transparent)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '100px',
          width: '400px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.2), transparent)',
          filter: 'blur(60px)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 900,
            color: 'white',
          }}
        >
          S
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.03em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div>StudentOS</div>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: '28px',
          color: '#a78bfa',
          marginTop: '16px',
          fontWeight: 500,
        }}
      >
        Learn. Grow. Achieve.
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: '20px',
          color: '#94a3b8',
          marginTop: '32px',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        The AI Operating System for Students — powered by Junova AI
      </div>
    </div>,
    size,
  );
}
