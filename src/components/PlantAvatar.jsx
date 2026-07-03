import { getPlant, getPlantEmoji } from "../lib/plants";

export default function PlantAvatar({ plantType, totalCompletions = 0, size = "md" }) {
  const plant = getPlant(plantType);
  const emoji = getPlantEmoji(plantType, totalCompletions);

  const sizes = {
    sm: "w-11 h-11 text-xl",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
    xl: "w-28 h-28 text-6xl",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center shrink-0 shadow-soft`}
      style={{ backgroundColor: plant.soft }}
    >
      <span role="img" aria-label={plant.name} className="leading-none select-none">
        {emoji}
      </span>
    </div>
  );
}
