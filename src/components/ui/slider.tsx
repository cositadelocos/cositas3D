import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: number[];
  onValueChange: (value: number[]) => void;
};

export function Slider({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? 0}
      onChange={(event) => onValueChange([Number(event.target.value)])}
      className={cn("control-slider", className)}
      {...props}
    />
  );
}
