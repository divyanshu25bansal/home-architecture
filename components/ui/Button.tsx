// components/ui/Button.tsx

import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
                                           variant = "primary",
                                           size = "md",
                                           fullWidth = false,
                                           className = "",
                                           children,
                                           ...props
                                       }) => {
    const classes = [
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? "btn--full" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;