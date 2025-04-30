import { ReactElement, MouseEvent } from "react";
import { ZodString, ZodEffects } from "zod";

// 기본 공통 속성
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// 입력 필드 공통 속성
interface InputBaseProps extends BaseProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "date" | "time";
  readOnly?: boolean;
  onEnter?: () => void;
  name?: string;
}

export interface ButtonProps extends BaseProps {
  highlight?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "default" | "small" | "full";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  target?: string;
}

export interface InputContainerProps extends BaseProps {
  input: ReactElement;
  children: ReactElement;
}

export interface TextInputProps extends InputBaseProps {
  align?: "v" | "h";
  ariaLabel?: string;
  children?: ReactElement;
}

export interface JoinInputProps extends InputBaseProps {
  label: string; // required
  validation?: ZodString | ZodEffects<ZodString>;
  message?: string;
  disabled?: boolean;
  max?: number;
  vertical?: boolean;
}

export interface SearchInputProps extends InputBaseProps {
  label: string; // required
  inputClassName?: string;
  onSearch: () => void;
}

export interface CheckboxProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface RadioProps extends BaseProps {
  checked: string;
  onChange: (checked: string) => void;
  items: { value: string; label: string }[];
  align?: "v" | "h";
}

export interface SelectInputProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export interface SelectProps extends SelectInputProps {
  label?: string;
  align?: "v" | "h";
}

export interface TextAreaProps extends BaseProps {
  ref?: React.RefObject<HTMLTextAreaElement>;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  resize?: boolean;
  rows?: number;
  max?: number;
  onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}
