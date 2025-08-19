import { useCallback, useRef, useEffect } from 'react';

interface UseMultilingualInputProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export const useMultilingualInput = ({ value, onChange, language }: UseMultilingualInputProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  // Store cursor position before any changes
  const cursorRef = useRef<{ start: number; end: number } | null>(null);
  
  // Update cursor position when value changes externally
  useEffect(() => {
    if (inputRef.current && cursorRef.current) {
      const { start, end } = cursorRef.current;
      const newStart = Math.min(start, value.length);
      const newEnd = Math.min(end, value.length);
      
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newStart, newEnd);
          inputRef.current.focus();
        }
      });
      
      // Clear cursor reference after restoration
      cursorRef.current = null;
    }
  }, [value]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const newValue = target.value;
    
    // Store current cursor position before state update
    cursorRef.current = {
      start: target.selectionStart,
      end: target.selectionEnd
    };
    
    // Update the value
    onChange(newValue);
  }, [onChange]);

  const getInputProps = useCallback(() => ({
    ref: inputRef,
    value,
    onChange: handleChange,
    // Simplified text direction handling
    dir: 'ltr',
    lang: language,
    // Remove problematic CSS properties that might cause text inversion
    style: {
      textAlign: 'left',
      direction: 'ltr',
      unicodeBidi: 'normal'
    }
  }), [value, handleChange, language]);

  return {
    inputRef,
    handleChange,
    getInputProps
  };
};
