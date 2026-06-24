
export default function Avatar({ src, alt = "User avatar", size = "1em", style = {} }) {
  if (!src) return <span style={{ fontSize: size, ...style }}>👤</span>;

  const isUrl = src.startsWith('http') || src.startsWith('data:image');

  if (isUrl) {
    return (
      <img 
        src={src} 
        alt={alt} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover', 
          display: 'inline-block',
          verticalAlign: 'middle',
          ...style 
        }} 
      />
    );
  }

  return (
    <span style={{ fontSize: size, display: 'inline-block', verticalAlign: 'middle', ...style }}>
      {src}
    </span>
  );
}
