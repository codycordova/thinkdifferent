/**
 * Styled “piece name” line for products — reads as a titled work, not body copy.
 * Decorative quote marks are aria-hidden; visible title text remains for accessibility.
 */
export default function ProductPieceTitle({
  title,
  as: Tag = 'span',
  className = '',
}: {
  title: string;
  as?: 'h1' | 'p' | 'span';
  className?: string;
}) {
  return (
    <Tag className={['text-[#111]', className].filter(Boolean).join(' ')}>
      <span className="font-handwritten font-semibold tracking-wide">
        <span className="text-[#111]/35" aria-hidden>
          &ldquo;
        </span>
        {title}
        <span className="text-[#111]/35" aria-hidden>
          &rdquo;
        </span>
      </span>
    </Tag>
  );
}
