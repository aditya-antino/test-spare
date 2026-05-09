interface IconButtonProps {
    icon: React.ReactNode;
    isActive: boolean;
    onClick?: () => void;
}

const IconButton = ({ icon, isActive, onClick }: IconButtonProps) => {
    return (
        <div
            className={`h-10 w-10 flex items-center justify-center ${
                isActive && 'bg-[#F6CD28] rounded-full'
            } cursor-pointer`}
            onClick={onClick}
        >
            {icon}
        </div>
    );
};

export default IconButton;
