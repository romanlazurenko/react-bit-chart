interface ZoomControlsProps {
  onZoomChange: (minutes: number | null) => void;
}

const buttonStyle = {
  padding: "8px 16px",
  margin: "0 8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  cursor: "pointer",
};

export function ZoomControls({ onZoomChange }: ZoomControlsProps) {
  return (
    <div style={{ marginTop: "1rem", textAlign: "center" }}>
      <button onClick={() => onZoomChange(null)} style={buttonStyle}>
        Reset Zoom
      </button>
      <button onClick={() => onZoomChange(15)} style={buttonStyle}>
        15m
      </button>
      <button onClick={() => onZoomChange(60)} style={buttonStyle}>
        1h
      </button>
      <button onClick={() => onZoomChange(240)} style={buttonStyle}>
        4h
      </button>
    </div>
  );
}
