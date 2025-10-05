type ButtonProps = {
  text: string;
  onClick?: () => void;
  className?: string;
};

export default function Button({ text, onClick, className }: ButtonProps) {
  return (
    <button
      className={`bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition-all ${className || ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}