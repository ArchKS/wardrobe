import Select, { StylesConfig } from 'react-select'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '请选择...',
  className
}: SearchableSelectProps) {
  const selectOptions: Option[] = options.map(opt => ({
    value: opt,
    label: opt
  }))

  const selectedOption = selectOptions.find(opt => opt.value === value) || null

  const customStyles: StylesConfig<Option, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '32px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      fontSize: '14px',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? '#eff6ff'
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer',
      padding: '6px 8px',
      fontSize: '14px',
      '&:active': {
        backgroundColor: '#3b82f6'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      marginTop: '4px',
      overflow: 'hidden'
    }),
    input: (provided) => ({
      ...provided,
      color: '#1f2937',
      fontSize: '14px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
      fontSize: '14px'
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? '#3b82f6' : '#6b7280',
      padding: '4px',
      '&:hover': {
        color: '#3b82f6'
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: '4px'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    })
  }

  return (
    <Select
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      options={selectOptions}
      styles={customStyles}
      placeholder={placeholder}
      isClearable
      isSearchable
      className={className}
      noOptionsMessage={() => '无匹配选项'}
    />
  )
}
