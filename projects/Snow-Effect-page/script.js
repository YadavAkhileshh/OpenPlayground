const { useState } = React;
const Snow = () => {
  const [snowflakes] = useState(() => {
    // Generate 50 snowflakes with random properties
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: (Math.random() * 4 + 3) * 1.3 + "s",
      animationDelay: Math.random() * 2 + "s",
      opacity: Math.random() * 0.7 + 0.9,
      size: Math.random() * 3 + 2 + "px"
    }));
  });

  return (
    <div className="snow-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            width: flake.size,
            height: flake.size
          }}
        />
      ))}
    </div>
  );
};

ReactDOM.render(<Snow />, document.getElementById("root"));
