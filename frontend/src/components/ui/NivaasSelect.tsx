import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface NivaasSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  name?: string;
}

export function NivaasSelect({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  className,
  triggerClassName,
  name,
}: NivaasSelectProps) {
  if (value === "") console.warn("NivaasSelect received an empty option value for 'value'");
  if (defaultValue === "") console.warn("NivaasSelect received an empty option value for 'defaultValue'");

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
          {label}
        </label>
      )}
      <Select
        value={value || undefined}
        defaultValue={defaultValue || undefined}
        onValueChange={onChange}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger 
          className={cn(
            "w-full rounded-2xl border-transparent bg-[var(--paper)] px-4 py-3 h-auto min-h-[48px] text-sm font-semibold text-[var(--ink)] shadow-none transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--sand)] focus:ring-1 focus:ring-[var(--ink)] focus:border-[var(--ink)]",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className="rounded-[20px] border border-[var(--line-strong)] bg-white p-2 shadow-[0_12px_40px_rgba(35,31,28,0.12)] max-h-[300px]"
          position="popper"
          sideOffset={8}
        >
          <SelectGroup>
            {options.map((option) => {
              if (option.value === "") {
                console.warn("NivaasSelect received an empty option value in options array");
              }
              const itemValue = option.value === "" ? "_empty_" : option.value;
              return (
                <SelectItem 
                  key={itemValue} 
                  value={itemValue}
                  className="cursor-pointer rounded-xl py-2.5 px-4 text-sm font-medium text-[var(--ink)] hover:bg-[var(--sand)] focus:bg-[var(--sand)] focus:text-[var(--ink)] data-[state=checked]:text-[var(--orange-dark)] data-[state=checked]:bg-[var(--peach)]"
                >
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
