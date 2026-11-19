
import React from "react";

const CommonButton = ({
    children,
    variant = "primary",
    size = "",
    type = "button",
    icon,
    loading = false,
    disabled = false,
    onClick,
    className = "",
    title
}) => {

    return (
        <button
            type={type}
            className={`btn btn-${variant} ${size ? `btn-${size}` : ""} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
        >
            {loading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                    />
                    Please wait...
                </>
            ) : (
                <>
                    {icon && <i className={`${icon} me-2`}></i>}
                    {children}
                </>
            )}
        </button>
    );
};

export default CommonButton;
