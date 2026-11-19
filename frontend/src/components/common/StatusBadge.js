function StatusBadge({ status }) {

    const getClassName = () => {
        switch (status) {
            case "COMPLETED":
            case "PAID":
            case "SAFE":
            case "NORMAL":
            case "IN":
                return "badge bg-success";

            case "PENDING":
            case "PARTIAL":
            case "EXPIRING SOON":
            case "LOW STOCK":
            case "ADJUSTMENT":
                return "badge bg-warning text-dark";

            case "CANCELLED":
            case "EXPIRED":
            case "UNPAID":
            case "OUT OF STOCK":
            case "OUT":
                return "badge bg-danger";

            case "CONFIRMED":
            case "READY":
                return "badge bg-info text-dark";

            default:
                return "badge bg-secondary";
        }
    };

    return (
        <span className={getClassName()}>
            {status}
        </span>
    );
}

export default StatusBadge;