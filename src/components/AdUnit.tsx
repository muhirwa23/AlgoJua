import React from 'react';

interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const AdUnit: React.FC<AdUnitProps> = ({ 
  slotId = "1234567890", // Default placeholder ID
  format = "auto", 
  className = "",
  label = "Advertisement",
  style
}) => {
  // In a real environment, this would be the AdSense script
  // For dev/preview, we show a placeholder
  return (
    <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
      <div 
        className="w-full bg-muted/50 border border-border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm"
        style={{ 
          minHeight: format === 'vertical' ? '600px' : '250px',
          ...style 
        }}
      >
        <div className="text-center p-4">
          <p className="font-semibold">Ad Space</p>
          <p className="text-xs opacity-75">{format === 'vertical' ? '300x600 / 160x600' : 'Responsive Unit'}</p>
        </div>
      </div>
    </div>
  );
};
