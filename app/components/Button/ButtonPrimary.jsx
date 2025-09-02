import React from 'react';
import Button from './Button';

const ButtonPrimary = ({ className = '', ...props }) => {
  return (
    <Button
      className={`rounded-full bg-primary text-black hover:bg-primary/80 disabled:bg-opacity-70 ${className}`}
      {...props}
    />
  );
};

export default ButtonPrimary;
