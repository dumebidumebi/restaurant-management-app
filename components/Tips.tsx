import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TipComponentProps {
  onTipChange: (tipAmount: number) => void;
}

const TipComponent: React.FC<TipComponentProps> = ({ onTipChange }) => {
  const [selectedTip, setSelectedTip] = useState<number | "custom">(3); // Default to 20% ($3.00)
  const [customTip, setCustomTip] = useState<number>(0);
  const [isCustomTipOpen, setIsCustomTipOpen] = useState(false);

  const handleTipSelect = (tip: number | "custom") => {
    setSelectedTip(tip);
    if (tip === "custom") {
      setIsCustomTipOpen(true);
    } else {
      onTipChange(tip);
    }
  };

  const handleCustomTipSubmit = () => {
    onTipChange(customTip);
    setIsCustomTipOpen(false);
  };

  return (
    <div className="max-w-96 my-4">
      <h3 className="text-lg font-semibold mb-4">Tip</h3>
      <div className="flex space-x-4">
        {[1.5, 2.25, 3].map((tip) => (
          <button
            key={tip}
            onClick={() => handleTipSelect(tip)}
            className={`px-4 py-2 border rounded-md ${
              selectedTip === tip
                ? "border-blue-500 text-blue-500"
                : "border-gray-300"
            }`}
          >
            <div className="text-sm font-medium">${tip.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {(tip / 15).toFixed(0)}%
            </div>
          </button>
        ))}
        <button
          onClick={() => handleTipSelect("custom")}
          className={`px-4 py-2 border rounded-md ${
            selectedTip === "custom"
              ? "border-blue-500 text-blue-500"
              : "border-gray-300"
          }`}
        >
          <div className="text-sm font-medium">Custom</div>
        </button>
      </div>

      {isCustomTipOpen && (
        <div className="mt-4 p-4 border rounded-md ">
          <h4 className="text-lg font-semibold mb-2">Custom Tip</h4>
          <div className="flex items-center space-x-4">
            <div>
              <label
                htmlFor="customAmount"
                className="block text-sm font-medium"
              >
                Amount
              </label>
              <Input
                id="customAmount"
                type="number"
                value={customTip}
                onChange={(e) => setCustomTip(parseFloat(e.target.value) || 0)}
                placeholder="$0.00"
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="customPercent"
                className="block text-sm font-medium"
              >
                Percent
              </label>
              <Input
                id="customPercent"
                type="number"
                value={(customTip / 15).toFixed(0)}
                disabled
                className="w-full bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={(e) => {
                e.preventDefault(); // Prevent the default form submission behavior
                handleCustomTipSubmit(); // Call your custom tip submission logic
              }}
              className="text-white"
            >
              Done
            </Button>

            <button
              onClick={() => setIsCustomTipOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipComponent;
