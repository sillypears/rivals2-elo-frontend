import * as React from "react";

export function Card({ className, ...props }) {
  return <div className={`rounded-lg bg-gray-200 p-4 text-black shadow-md text-center justify-center ${className}`} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={` font-semibold ${className}`} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={`text-md font-bold ${className}`} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={`text-sm  ${className}`} {...props} />;
}
