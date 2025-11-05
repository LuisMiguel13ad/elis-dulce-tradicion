"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2, XCircle, Loader2, Edit2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddressData {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  verified: boolean;
}

interface AddressVerificationProps {
  onAddressChange: (address: AddressData | null) => void;
  initialAddress?: AddressData | null;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function AddressVerification({ onAddressChange, initialAddress }: AddressVerificationProps) {
  const { t } = useLanguage();
  const [addressInput, setAddressInput] = useState(initialAddress?.fullAddress || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [addressData, setAddressData] = useState<AddressData | null>(initialAddress || null);
  const [apartment, setApartment] = useState(initialAddress?.apartment || '');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Check if Google Maps is loaded - improved detection
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) {
      return;
    }

    // Check periodically
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 500);

    // Also listen for script load
    const script = document.querySelector('script[src*="maps.googleapis.com"]');
    if (script) {
      script.addEventListener('load', checkGoogleMaps);
    }

    return () => {
      clearInterval(interval);
      if (script) {
        script.removeEventListener('load', checkGoogleMaps);
      }
    };
  }, []);

  // Search for address suggestions
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    if (!isGoogleMapsLoaded) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(true);

    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'us' },
          types: ['address'],
        },
        (predictions: any[] | null, status: string) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error searching addresses:', error);
      setIsLoading(false);
      setSuggestions([]);
    }
  }, [isGoogleMapsLoaded]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (addressInput.length >= 3 && isGoogleMapsLoaded) {
      debounceTimerRef.current = setTimeout(() => {
        searchAddress(addressInput);
      }, 300);
    } else {
      setSuggestions([]);
      if (addressInput.length < 3) {
        setShowSuggestions(false);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [addressInput, isGoogleMapsLoaded, searchAddress]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: any) => {
    setAddressInput(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsLoading(true);

    // Get full address details
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['address_components', 'formatted_address'],
        },
        (place: any, status: string) => {
          setIsLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const components = place.address_components;
            let street = '';
            let city = '';
            let state = '';
            let zipCode = '';

            components.forEach((component: any) => {
              const types = component.types;
              if (types.includes('street_number')) {
                street = component.long_name + ' ';
              }
              if (types.includes('route')) {
                street += component.long_name;
              }
              if (types.includes('locality')) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
              if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            const verifiedAddress: AddressData = {
              street: street.trim(),
              apartment: apartment || undefined,
              city,
              state,
              zipCode,
              fullAddress: place.formatted_address || suggestion.description,
              verified: true,
            };

            setAddressData(verifiedAddress);
            onAddressChange(verifiedAddress);
          } else {
            setIsLoading(false);
          }
        }
      );
    }
  }, [apartment, onAddressChange]);

  // Update address when apartment changes
  useEffect(() => {
    if (addressData && addressData.verified) {
      const baseAddress = addressData.fullAddress.replace(/, Apt.*$/, '');
      const updatedAddress: AddressData = {
        ...addressData,
        apartment: apartment || undefined,
        fullAddress: apartment 
          ? `${baseAddress}, Apt ${apartment}`
          : baseAddress,
      };
      setAddressData(updatedAddress);
      onAddressChange(updatedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartment]); // Only run when apartment changes

  // Handle manual address entry when user presses Enter or when Google Maps isn't available
  const handleManualAddressSubmit = useCallback(() => {
    if (!addressInput || addressInput.length < 10) {
      return;
    }

    // Try to parse address - format: "Street, City, State ZIP" or "Street, City, State, ZIP"
    const parts = addressInput.split(',').map(p => p.trim());
    
    if (parts.length >= 3) {
      // Extract state and zip from last part
      const lastPart = parts[parts.length - 1];
      const stateZipMatch = lastPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
      
      let state = '';
      let zipCode = '';
      
      if (stateZipMatch) {
        state = stateZipMatch[1];
        zipCode = stateZipMatch[2];
      } else {
        // Try alternative format
        const stateZipParts = lastPart.split(/\s+/);
        if (stateZipParts.length >= 2) {
          state = stateZipParts[0].toUpperCase();
          zipCode = stateZipParts[1];
        } else {
          // Last resort - use second to last as state, last as zip
          if (parts.length >= 4) {
            state = parts[parts.length - 2].toUpperCase();
            zipCode = parts[parts.length - 1];
          }
        }
      }

      const manualAddress: AddressData = {
        street: parts[0] || '',
        city: parts.length >= 3 ? parts.slice(1, -1).join(', ') : parts[1] || '',
        state: state || (parts.length >= 4 ? parts[parts.length - 2] : ''),
        zipCode: zipCode || (parts.length >= 4 ? parts[parts.length - 1] : ''),
        fullAddress: addressInput,
        verified: true,
        apartment: apartment || undefined,
      };

      // Validate we have at least street, city, and some form of state/zip
      if (manualAddress.street && manualAddress.city && (manualAddress.state || manualAddress.zipCode)) {
        setAddressData(manualAddress);
        onAddressChange(manualAddress);
        setShowSuggestions(false);
      }
    } else if (parts.length === 2 && addressInput.length > 15) {
      // If only 2 parts but looks like a full address, accept it
      const manualAddress: AddressData = {
        street: parts[0] || '',
        city: parts[1] || '',
        state: '',
        zipCode: '',
        fullAddress: addressInput,
        verified: true,
        apartment: apartment || undefined,
      };
      setAddressData(manualAddress);
      onAddressChange(manualAddress);
      setShowSuggestions(false);
    }
  }, [addressInput, apartment, onAddressChange]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && addressInput && !showSuggestions) {
      // If no suggestions showing and user presses Enter, try to submit as manual entry
      if (!isGoogleMapsLoaded || addressInput.length >= 10) {
        e.preventDefault();
        handleManualAddressSubmit();
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAddressValid = addressData?.verified && addressData.street && addressData.city && addressData.state && addressData.zipCode;

  return (
    <div className="space-y-4">
      {/* Single Address Search Input */}
      <div className="relative space-y-2">
        <Label htmlFor="address-search">
          {t('Dirección de Entrega', 'Delivery Address')} *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            id="address-search"
            type="text"
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              setSelectedIndex(-1);
              if (addressData) {
                setAddressData(null);
                onAddressChange(null);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 || (addressInput.length >= 3 && isGoogleMapsLoaded)) {
                setShowSuggestions(true);
              }
            }}
            placeholder={
              isGoogleMapsLoaded
                ? t(
                    'Escriba su dirección (ej: 123 Main St, Philadelphia, PA)',
                    'Type your address (e.g., 123 Main St, Philadelphia, PA)'
                  )
                : t(
                    'Escriba su dirección completa',
                    'Enter your full address'
                  )
            }
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {!isGoogleMapsLoaded && addressInput.length === 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {t('Cargando...', 'Loading...')}
            </span>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && addressInput.length >= 3 && isGoogleMapsLoaded && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-card shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {t('Buscando direcciones...', 'Searching addresses...')}
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                  className={`cursor-pointer px-4 py-3 transition-colors ${
                    index === selectedIndex ? 'bg-primary/20' : 'hover:bg-primary/10'
                  } ${index === 0 ? 'rounded-t-md' : ''} ${
                    index === suggestions.length - 1 ? 'rounded-b-md' : 'border-b border-border'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{suggestion.description}</span>
                  </div>
                </div>
              ))
            ) : addressInput.length >= 3 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('No se encontraron direcciones.', 'No addresses found.')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualEntry(true)}
                  className="text-xs"
                >
                  {t('Ingresar manualmente', 'Enter manually')}
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* Manual entry fallback message */}
        {!isGoogleMapsLoaded && addressInput.length > 0 && !isAddressValid && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
              {t(
                'Autocompletado no disponible. Ingrese su dirección completa (ej: 123 Main St, Philadelphia, PA 19020) y presione Enter para verificar.',
                'Autocomplete not available. Enter your full address (e.g., 123 Main St, Philadelphia, PA 19020) and press Enter to verify.'
              )}
            </p>
            {addressInput.length >= 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualAddressSubmit}
                className="text-xs"
              >
                {t('Verificar dirección', 'Verify Address')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Apartment/Unit Field - Only show after address is verified */}
      {isAddressValid && (
        <div className="space-y-2">
          <Label htmlFor="apartment">
            {t('Apartamento/Unidad', 'Apartment/Unit')} ({t('Opcional', 'Optional')})
          </Label>
          <Input
            id="apartment"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder={t('Apt 4B, Unit 12, etc.', 'Apt 4B, Unit 12, etc.')}
          />
        </div>
      )}

      {/* Address Confirmation */}
      {isAddressValid && addressData && (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">
                {t('Dirección Verificada', 'Verified Address')}
              </Label>
              <p className="font-semibold text-foreground text-sm">{addressData.fullAddress}</p>
              {apartment && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('Apartamento', 'Apartment')}: {apartment}
                </p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddressData(null);
                  setAddressInput('');
                  setApartment('');
                  onAddressChange(null);
                }}
                className="mt-2 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                {t('Cambiar dirección', 'Change address')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error State - Only show if user has typed something and it's not loading */}
      {!isAddressValid && addressInput.length > 0 && !isLoading && !showSuggestions && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive mb-2">
                {t(
                  'Por favor seleccione una dirección de las sugerencias o ingrese una dirección completa (ej: 123 Main St, Philadelphia, PA 19020)',
                  'Please select an address from the suggestions or enter a complete address (e.g., 123 Main St, Philadelphia, PA 19020)'
                )}
              </p>
              {!isGoogleMapsLoaded && (
                <p className="text-xs text-muted-foreground">
                  {t(
                    'Nota: El autocompletado no está disponible. Ingrese su dirección completa manualmente.',
                    'Note: Autocomplete is not available. Please enter your full address manually.'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
