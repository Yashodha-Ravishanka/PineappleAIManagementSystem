import "./StatusCard.css";
function StatusCard({ title, value }) {
    const getCardType = () => {
        const text = title.toLowerCase();

        if (text.includes("good")) return "good";
        if (text.includes("average")) return "average";
        if (text.includes("bad")) return "bad";
        if (text.includes("high risk")) return "high-risk";
        if (text.includes("medium risk")) return "medium-risk";
        if (text.includes("low risk")) return "low-risk";
        if (text.includes("temperature")) return "temperature";
        if (text.includes("humidity")) return "humidity";
        if (text.includes("mq135")) return "air";
        if (text.includes("batch")) return "batch";
        if (text.includes("sensor")) return "sensor";

        return "default";
    };

    const getIcon = () => {
        const text = title.toLowerCase();

        if (text.includes("good")) return "✅";
        if (text.includes("average")) return "⚠️";
        if (text.includes("bad")) return "❌";
        if (text.includes("high risk")) return "🔴";
        if (text.includes("medium risk")) return "🟠";
        if (text.includes("low risk")) return "🟢";
        if (text.includes("temperature")) return "🌡️";
        if (text.includes("humidity")) return "💧";
        if (text.includes("mq135")) return "🌫️";
        if (text.includes("batch")) return "🍍";
        if (text.includes("sensor")) return "📡";

        return "📊";
    };

    return (
        <div className={`status-card status-card-${getCardType()}`}>
            <div className="status-card-icon">
                {getIcon()}
            </div>

            <div className="status-card-content">
                <p className="status-card-title">
                    {title}
                </p>

                <h3 className="status-card-value">
                    {value}
                </h3>
            </div>
        </div>
    );
}

export default StatusCard;