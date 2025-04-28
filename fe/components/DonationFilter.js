"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as Popover from "@radix-ui/react-popover";
import * as Slider from "@radix-ui/react-slider";

export default function DonationFilter({ onFilterChange }) {
  const [filters, setFilters] = useState({
    quantity: "",
    foodType: "",
    expirationDate: null,
    location: "",
    minQuantity: 0,
    maxQuantity: 100
  });

  const foodTypes = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Dairy",
    "Meat",
    "Bakery",
    "Canned Goods",
    "Other"
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      quantity: "",
      foodType: "",
      expirationDate: null,
      location: "",
      minQuantity: 0,
      maxQuantity: 100
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Donations
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Food Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Food Type</label>
          <Select
            value={filters.foodType}
            onValueChange={(value) => handleFilterChange("foodType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select food type" />
            </SelectTrigger>
            <SelectContent>
              {foodTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Expiration Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Expiration Date</label>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.expirationDate ? (
                  format(filters.expirationDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="rounded-md border bg-white p-4 shadow-md"
                sideOffset={5}
              >
                <DatePicker
                  selected={filters.expirationDate}
                  onChange={(date) => handleFilterChange("expirationDate", date)}
                  inline
                  minDate={new Date()}
                />
                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Quantity Range Filter */}
        <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
          <label className="text-sm font-medium">Quantity Range</label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              value={filters.minQuantity}
              onChange={(e) => handleFilterChange("minQuantity", parseInt(e.target.value))}
              className="w-24"
            />
            <span>to</span>
            <Input
              type="number"
              min="0"
              value={filters.maxQuantity}
              onChange={(e) => handleFilterChange("maxQuantity", parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[filters.minQuantity, filters.maxQuantity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => {
              handleFilterChange("minQuantity", value[0]);
              handleFilterChange("maxQuantity", value[1]);
            }}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
} 