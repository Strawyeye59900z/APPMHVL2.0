interface AvatarProps {
  initials: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export default function Avatar({ initials, size = 40, bgColor, fgColor }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: bgColor ?? 'var(--tw-color-accent-soft, #2d2618)',
        color: fgColor ?? '#d4ad6b',
        flexShrink: 0,
        fontWeight: 700,
        fontSize: size * 0.36,
      }}
      className="flex items-center justify-center"
    >
      {initials}
    </div>
  );
}
