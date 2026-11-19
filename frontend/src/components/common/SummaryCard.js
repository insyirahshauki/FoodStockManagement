
import React from "react";

const SummaryCard = ({
    title,
    value,
    // subtitle,
    color = "primary",
    textColor ="",
    icon
}) => {
    return (
        <div className="col-12 col-sm-6 col-xl-4 mb-4">
            <div className={`card summary-card border-start border-4 border-${color}`}>
                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>
                            <div className="text-muted small mb-2">
                                {title}
                            </div>

                            <div className={`fs-4 fw-bold text-${textColor}`} >
                                {value ?? 0}
                            </div>

                            {/* {subtitle && (
                                <div className="text-muted small mt-2">
                                    {subtitle}
                                </div>
                            )} */}
                        </div>

                        {icon && (
                            <div className={`summary-card-icon text-${color}`}>
                                {icon}
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
