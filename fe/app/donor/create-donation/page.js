"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Calendar, MapPin, Loader2 } from "lucide-react";

export default function CreateDonation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodType: "",
    quantity: "",
    quantityUnit: "kg",
    pickupAddress: "",
    pickupDate: "",
    expirationDate: "",
    societyName: "",
    lane: "",
    area: "",
    locality: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: ""
  });

  const foodTypes = [
    "Fresh Produce",
    "Canned Goods",
    "Bread & Bakery",
    "Dairy",
    "Grains & Cereals",
    "Meat & Protein",
    "Prepared Meals",
    "Beverages",
    "Snacks",
    "Other"
  ];

  const quantityUnits = [
    "kg",
    "g",
    "lbs",
    "items",
    "packages",
    "servings",
    "boxes",
    "crates"
  ];

  // Set up axios interceptors for debugging
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use((config) => {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
      return config;
    }, (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    });

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use((response) => {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      });
      return response;
    }, (error) => {
      console.error('Response Error:', error.response || error);
      return Promise.reject(error);
    });

    // Clean up interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) || "" : value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const getCurrentLocation = () => {
  //   setLocationLoading(true);
  //   setLocationError("");
  
  //   if (!navigator.geolocation) {
  //     setLocationError("Geolocation is not supported by your browser");
  //     setLocationLoading(false);
  //     return;
  //   }
  
  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       try {
  //         const { latitude, longitude } = position.coords;
  //         console.log('Obtained coordinates:', latitude, longitude); // Debugging
          
  //         // Reverse geocoding with proper user agent
  //         const response = await fetch(
  //           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
  //           {
  //             headers: {
  //               'User-Agent': 'FoodDonationApp/1.0 (contact@example.com)'
  //             }
  //           }
  //         );
  
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  
  //         const data = await response.json();
  //         console.log('Geocoding response:', data); // Debugging
  
  //         // Construct address from individual components
  //         const addr = data.address;
  //         const addressComponents = [];
  //         console.log(addr)
  //         // Add relevant address parts in order of specificity
  //         if (addr.road) addressComponents.push(addr.road);
  //         if (addr.neighbourhood) addressComponents.push(addr.neighbourhood);
  //         if (addr.suburb) addressComponents.push(addr.suburb);
  //         if (addr.city_district) addressComponents.push(addr.city_district);
  //         if (addr.postcode) addressComponents.push(addr.postcode);
  //         if (addr.city) addressComponents.push(addr.city);
  //         if (addr.state) addressComponents.push(addr.state);
  //         if (addr.country) addressComponents.push(addr.country);
  
  //         const formattedAddress = addressComponents.join(', ') || data.display_name;
  
  //         setFormData(prev => ({
  //           ...prev,
  //           pickupAddress: formattedAddress
  //         }));
  
  //         setLocationLoading(false);
  //       } catch (error) {
  //         console.error("Geocoding error:", error);
  //         setLocationError("Failed to get accurate address. Please enter manually.");
  //         setLocationLoading(false);
  //       }
  //     },
  //     (error) => {
  //       console.error("Geolocation error:", error);
  //       let errorMessage = "Failed to get your location.";
        
  //       if (error.code === 1) {
  //         errorMessage = "Location access denied. Please allow location access or enter address manually.";
  //       } else if (error.code === 2) {
  //         errorMessage = "Location unavailable. Please try again or enter address manually.";
  //       } else if (error.code === 3) {
  //         errorMessage = "Location request timed out. Please try again or enter address manually.";
  //       }
        
  //       setLocationError(errorMessage);
  //       setLocationLoading(false);
  //     },  
  //     { 
  //       enableHighAccuracy: true,
  //       timeout: 20000,  // Increased timeout
  //       maximumAge: 0
  //     }
  //   );
  // };

  async function getLocationInCommonFormat() {
    setLocationLoading(true);
    setLocationError("");
  
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000
        });
      });
  
      const { latitude, longitude } = position.coords;
  
      // First try Mapbox
      if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=poi,neighborhood,locality&limit=1`
          );
          
          const data = await response.json();
          
          if (data.features?.length > 0) {
            const feature = data.features[0];
            let area = '';
            let locality = '';
            
            // Extract Mumbai-specific locality names
            if (feature.place_type.includes('poi')) {
              locality = feature.text; // e.g., "Bandstand"
            }
            
            // Get neighborhood (Bandra West)
            const neighborhood = data.features.find(f => f.place_type.includes('neighborhood'));
            if (neighborhood) {
              area = neighborhood.text;
            }
  
            // Fallback to context items
            feature.context?.forEach(item => {
              if (item.id.includes('neighborhood') && !area) {
                area = item.text;
              } else if (item.id.includes('locality') && !locality) {
                locality = item.text;
              }
            });
  
            // For Mumbai, we want format: "Landmark, Area, Mumbai Pincode"
            const mumbaiAddress = [
              locality,
              area,
              'Mumbai',
              feature.context?.find(c => c.id.includes('postcode'))?.text || ''
            ].filter(Boolean).join(', ');
  
            setFormData(prev => ({
              ...prev,
              pickupAddress: mumbaiAddress,
              locality: locality,
              area: area,
              pincode: feature.context?.find(c => c.id.includes('postcode'))?.text || ''
            }));
            
            return;
          }
        } catch (e) {
          console.log("Mapbox failed, trying OSM", e);
        }
      }
  
      // Fallback to OpenStreetMap with Mumbai-specific parsing
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        { headers: { 'User-Agent': 'YourApp/1.0' } }
      );
  
      const osmData = await osmResponse.json();
      const addr = osmData.address;
  
      // Mumbai-specific formatting
      let landmark = addr.building || addr.amenity || '';
      let area = addr.suburb || '';
      let locality = addr.road || addr.neighbourhood || '';
      
      // Special handling for Mumbai areas
      if (addr.city_district) {
        // For areas like "Bandra West"
        if (addr.city_district.includes('Bandra')) {
          area = 'Bandra West';
          locality = landmark || 'Bandra';
        }
        // Similar handling for other areas
        else if (addr.city_district.includes('Worli')) {
          area = 'Worli';
          locality = landmark || 'Worli';
        }
      }
  
      const mumbaiAddress = [
        landmark,
        area,
        'Mumbai',
        addr.postcode || ''
      ].filter(Boolean).join(', ');
  
      setFormData(prev => ({
        ...prev,
        pickupAddress: mumbaiAddress,
        locality: landmark,
        area: area,
        pincode: addr.postcode || ''
      }));
  
    } catch (error) {
      setLocationError("Couldn't get location. Please enter manually.");
    } finally {
      setLocationLoading(false);
    }
  }

  async function getCurrentLocation() {
    setLocationLoading(true);
    setLocationError("");
  
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }
  
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
          }
        );
      });
  
      const { latitude, longitude } = position.coords;
  
      let addressComponents = {
        society: '',
        road: '',
        neighborhood: '',
        suburb: '',
        city: '',
        postcode: '',
        country: ''
      };
  
      // Try Mapbox API first
      if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,poi,neighborhood,place,postcode&limit=1`
          );
          
          const data = await response.json();
          if (data.features?.length > 0) {
            const feature = data.features[0];
            
            // Extract components
            feature.context?.forEach(item => {
              const [type] = item.id.split('.');
              if (type === 'neighborhood') addressComponents.neighborhood = item.text;
              else if (type === 'postcode') addressComponents.postcode = item.text;
              else if (type === 'place') addressComponents.city = item.text;
              else if (type === 'country') addressComponents.country = item.text;
            });
  
            addressComponents.road = feature.properties?.address || '';
            addressComponents.society = feature.text || '';
          }
        } catch (e) {
          console.log("Mapbox geocoding failed, falling back to OSM", e);
        }
      }
  
      // Fallback to OpenStreetMap
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FoodDonationApp/1.0 (contact@example.com)'
          }
        }
      );
  
      if (osmResponse.ok) {
        const osmData = await osmResponse.json();
        const addr = osmData.address;
  
        // Prioritize these fields for cleaner output
        addressComponents = {
          society: addr.building || addr.hotel || addr.amenity || '',
          road: addr.road || '',
          neighborhood: addr.neighbourhood || addr.suburb || '',
          suburb: addr.city_district || addr.residential || '',
          city: addr.city || addr.town || addr.county || '',
          postcode: addr.postcode || '',
          country: addr.country || ''
        };
      }
  
      // Format as single line without labels
      const formattedAddress = [
        addressComponents.society,
        addressComponents.road,
        addressComponents.neighborhood,
        addressComponents.suburb,
        addressComponents.city,
        addressComponents.postcode,
        addressComponents.country
      ].filter(Boolean).join(', ');
  
      setFormData(prev => ({
        ...prev,
        pickupAddress: formattedAddress,
        latitude,
        longitude
      }));
  
    } catch (error) {
      console.error("Location error:", error);
      setLocationError(
        error.code === 1 ? "Location access denied. Please enable permissions." :
        error.code === 2 ? "Location unavailable. Check your network/GPS." :
        error.code === 3 ? "Location request timed out. Try again." :
        "Couldn't get location. Please enter manually."
      );
    } finally {
      setLocationLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate required fields before sending to the API
    if (!formData.title) {
      setError("Title is required");
      setIsLoading(false);
      return;
    }

    if (!formData.foodType) {
      setError("Food type is required");
      setIsLoading(false);
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      setError("Quantity must be a positive number");
      setIsLoading(false);
      return;
    }

    if (!formData.pickupAddress) {
      setError("Pickup address is required");
      setIsLoading(false);
      return;
    }

    if (!formData.pickupDate) {
      setError("Pickup date is required");
      setIsLoading(false);
      return;
    }

    // Prepare data to match server expectations
    const donationData = {
      ...formData,
      // Ensure quantity is sent as a number
      quantity: Number(formData.quantity),
    };

    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      console.log("Sending donation data:", donationData);

      // Make API call to create donation
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/donations`,
        donationData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Redirect to donor dashboard on success
        router.push("/donor/dashboard");
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      
      // Show detailed validation errors if available
      if (error.response?.data?.errors) {
        const errorDetails = error.response.data.errors;
        let errorMessage = "Validation failed:";
        
        Object.keys(errorDetails).forEach(field => {
          if (errorDetails[field]._errors && errorDetails[field]._errors.length > 0) {
            errorMessage += `\n• ${field}: ${errorDetails[field]._errors.join(', ')}`;
          }
        });
        
        setError(errorMessage);
      } else {
        setError(
          error.response?.data?.message || 
          "An error occurred while creating your donation. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Create Donation</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Share Your Surplus Food</CardTitle>
          <CardDescription>
            Fill out the form below to create a new food donation listing.
            Your donation will be visible to eligible receivers in your area.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                placeholder="E.g., Fresh vegetables from local farm"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide more details about the food you're donating"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Food Type */}
            <div className="space-y-2">
              <Label htmlFor="foodType">Food Type <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => handleSelectChange(value, "foodType")}
                value={formData.foodType}
                required
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

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Amount"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unit</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange(value, "quantityUnit")}
                  value={formData.quantityUnit}
                  defaultValue="kg"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pickupAddress">Pickup Address <span className="text-red-500">*</span></Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center text-xs"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-1 h-3 w-3" /> Use current location
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="pickupAddress"
                name="pickupAddress"
                placeholder="Enter the full address where this food can be picked up"
                value={formData.pickupAddress}
                onChange={handleChange}
                required
              />
              {locationError && (
                <p className="text-sm text-red-500">{locationError}</p>
              )}
            </div>

            {/* Pickup Date */}
            <div className="space-y-2">
              <Label htmlFor="pickupDate">
                Pickup Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="pickupDate"
                  name="pickupDate"
                  type="datetime-local"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  required
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
              </div>
              <p className="text-sm text-gray-500">
                When will this food be available for pickup?
              </p>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expirationDate">
                Expiration Date
              </Label>
              <div className="relative">
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="datetime-local"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
              </div>
              <p className="text-sm text-gray-500">
                When will this food expire? (Leave blank if not applicable)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.includes('\n') ? (
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {error.split('\n').filter(Boolean).map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    error
                  )}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Donation"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 