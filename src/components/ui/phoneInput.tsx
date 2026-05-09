import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputComponentProps {
    phone: string;
    code: string;
    onChange: (phone: string, data: string) => void;
    label?: string;
    disabled?: boolean;
}

const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
    phone,
    code,
    label,
    onChange,
    disabled,
    ...props
}) => {
    const fixedDialCode = '91';

    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-gray-700 text-base font-semibold">{label}</label>}
            <PhoneInput
                {...props}
                disabled={disabled}
                country="in"
                value={phone}
                onChange={(value) => {
                    onChange(value, fixedDialCode);
                }}
                disableDropdown
                countryCodeEditable={false}
                containerStyle={{
                    width: '100%',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    padding: '2px 6px',
                    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                    border: '1px solid #D1D5DB',
                }}
                inputStyle={{
                    width: '100%',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '16px',
                }}
                buttonStyle={{
                    border: 'none',
                    background: 'transparent',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
};

export default PhoneInputComponent;
