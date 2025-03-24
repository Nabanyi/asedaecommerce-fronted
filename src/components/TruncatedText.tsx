
interface TruncatedTextProps {
    text: string;
    maxLength?: number;
}

function TruncatedText({ text, maxLength = 300 }: TruncatedTextProps) {
  if (text.length <= maxLength) {
    return <>{text}</>;
  }

  const truncatedText = text.substring(0, maxLength); // Leave space for "..."

  const fadeLength = 10; // Number of characters to fade
  const fadeStart = maxLength - fadeLength; // Start index of fade

  const fadingPart = text.substring(fadeStart, maxLength).split('').map((char, index) => {
    const opacity = Math.max(0, 1 - index / fadeLength);
    return (
      <span key={index} style={{ opacity }}>
        {char}
      </span>
    );
  });

  return (
    <>
      {truncatedText}
      {fadingPart}
    </>
  );
}

export default TruncatedText;