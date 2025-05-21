
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", withText = true, className = "" }: LogoProps) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/lovable-uploads/11351756-e1f5-4edf-a34a-d94f3880d8cf.png" 
        alt="Thryvance Logo" 
        className={sizes[size]} 
      />
      {withText && (
        <span className={`font-bold text-thryvance-green-dark ${size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"}`}>
          Thryvance
        </span>
      )}
    </Link>
  );
};

export default Logo;
