import React from 'react';
import Button from './Button';

const ButtonSecondary = ({ className = '', ...props }) => {
  return <Button className={`${className}`} {...props} />;
};

export default ButtonSecondary;
