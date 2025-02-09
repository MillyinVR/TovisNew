import { ChangeEvent } from 'react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Search by provider, service, date or rating..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
