const NoOperation = () => {
    const btnStyle = {
        padding: "8px 24px",
        background: "linear-gradient(to right, #64748b, #475569)",
        color: "white",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "9999px",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        boxShadow: "0 2px 6px rgba(124, 58, 237, 0.15)",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        cursor: "default",
    };

    return (
        <div style={{ textAlign: "center" }}>
            <div
                style={btnStyle}
            >
                暂无操作
            </div>
        </div>
    );
};

export default NoOperation;
