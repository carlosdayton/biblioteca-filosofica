export default function BackgroundTexture() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.03,
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(61,43,31,0.1) 2px,
          rgba(61,43,31,0.1) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(61,43,31,0.1) 2px,
          rgba(61,43,31,0.1) 4px
        )
      `,
      backgroundSize: '100px 100px',
    }} />
  )
}
