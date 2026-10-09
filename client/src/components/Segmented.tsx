interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  legend: string;
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

export default function Segmented<T extends string>({ legend, name, value, options, onChange }: Props<T>) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="segmented">
        {options.map((o) => (
          <label key={o.value} className="seg">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
