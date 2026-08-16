import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass, ShieldAlert, Award, Navigation, Info, Users, Globe } from 'lucide-react';

const LOCAL_COORDINATES = {
  'chennai': [13.0827, 80.2707],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.7041, 77.1025],
  'new delhi': [28.6139, 77.2090],
  'hyderabad': [17.3850, 78.4867],
  'pune': [18.5204, 73.8567],
  'kolkata': [22.5726, 88.3639],
  'ahmedabad': [23.0225, 72.5714],
  'jaipur': [26.9124, 75.7873],
  'gurgaon': [28.4595, 77.0266],
  'noida': [28.5355, 77.3910],
  'san francisco': [37.7749, -122.4194],
  'new york': [40.7128, -74.0060],
  'london': [51.5074, -0.1278],
  'tokyo': [35.6762, 139.6503],
  'singapore': [1.3521, 103.8198]
};

export default function ContactGeoMap({ contacts }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [searchTerm, setSearchTerm] = useState('');
  const [geocodedContacts, setGeocodedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, cities: {}, topCity: 'N/A' });

  // Get local cache helper
  const getCachedCoordinates = (address) => {
    const key = `cardsnap_geo_${address.toLowerCase().trim()}`;
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  };

  // Set local cache helper
  const setCachedCoordinates = (address, coords) => {
    const key = `cardsnap_geo_${address.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(coords));
  };

  // Perform geocoding
  useEffect(() => {
    const geocodeAll = async () => {
      setLoading(true);
      const list = [];
      const cityCounts = {};

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const address = contact.address;

        if (!address || address.trim() === '') continue;

        let coords = null;
        const normalizedAddress = address.toLowerCase();

        // 1. Check local pre-defined dictionary
        for (const city in LOCAL_COORDINATES) {
          if (normalizedAddress.includes(city)) {
            coords = LOCAL_COORDINATES[city];
            // Track city stats
            cityCounts[city] = (cityCounts[city] || 0) + 1;
            break;
          }
        }

        // 2. Check localstorage cache
        if (!coords) {
          coords = getCachedCoordinates(address);
        }

        // 3. Query OpenStreetMap Nominatim API if not found (with progressive simplified fallback)
        if (!coords) {
          const addressParts = address.split(',').map(p => p.trim()).filter(Boolean);
          const queriesToTry = [];
          
          // Full address
          queriesToTry.push(address);
          
          // Last 3 parts
          if (addressParts.length >= 3) {
            queriesToTry.push(addressParts.slice(-3).join(', '));
          }
          // Last 2 parts
          if (addressParts.length >= 2) {
            queriesToTry.push(addressParts.slice(-2).join(', '));
          }
          // Last part (usually country/city)
          if (addressParts.length >= 1) {
            queriesToTry.push(addressParts.slice(-1).join(', '));
          }

          for (const query of queriesToTry) {
            try {
              // Sleep to respect OSM Nominatim rate limits (Max 1 request per second)
              await new Promise((resolve) => setTimeout(resolve, 800));
              
              const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
              if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                  coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                  setCachedCoordinates(address, coords);
                  
                  // Track city stats
                  const displayName = data[0].display_name.toLowerCase();
                  let foundCity = 'other';
                  for (const city in LOCAL_COORDINATES) {
                    if (displayName.includes(city) || normalizedAddress.includes(city)) {
                      foundCity = city;
                      break;
                    }
                  }
                  cityCounts[foundCity] = (cityCounts[foundCity] || 0) + 1;
                  break; // Found coordinates! Exit the fallback loop.
                }
              }
            } catch (err) {
              console.error(`Error fetching geocoding for "${query}":`, err);
            }
          }
        } else {
          // If we got from cache or LOCAL_COORDINATES but didn't assign city count yet
          let foundCity = 'other';
          for (const city in LOCAL_COORDINATES) {
            if (normalizedAddress.includes(city)) {
              foundCity = city;
              break;
            }
          }
          cityCounts[foundCity] = (cityCounts[foundCity] || 0) + 1;
        }

        if (coords) {
          // Apply jitter if coordinates overlap exactly (common for same city matches)
          const jitterLat = (Math.random() - 0.5) * 0.02;
          const jitterLng = (Math.random() - 0.5) * 0.02;

          list.push({
            ...contact,
            lat: coords[0] + jitterLat,
            lng: coords[1] + jitterLng
          });
        }
      }

      // Compute statistics
      let topCity = 'N/A';
      let maxCount = 0;
      Object.keys(cityCounts).forEach((city) => {
        if (cityCounts[city] > maxCount) {
          maxCount = cityCounts[city];
          topCity = city.charAt(0).toUpperCase() + city.slice(1);
        }
      });

      setStats({
        total: list.length,
        cities: cityCounts,
        topCity: topCity
      });

      setGeocodedContacts(list);
      setLoading(false);
    };

    geocodeAll();
  }, [contacts]);

  // Leaflet map initialization
  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
      // Center map in India by default (suitable base for international grids)
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 5);

      // Add modern premium dark tile layers
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Re-add Zoom control at bottom right instead
      window.L.control.zoom({
        position: 'bottomright'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Render new markers
    geocodedContacts.forEach((contact) => {
      // High-tech pulse icon styling
      const customIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-cyan-400/50 opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 border-2 border-slate-950 shadow-[0_0_8px_#22d3ee]"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div style="background-color: #0b0f19; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 12px; font-family: 'Outfit', sans-serif; color: #f1f5f9; min-width: 180px;">
          <p style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #ffffff;">${contact.name || 'Unknown'}</p>
          <p style="font-size: 11px; margin: 0 0 8px 0; color: #a5f3fc; font-weight: 600; font-family: 'Space Grotesk', sans-serif;">${contact.job_title || 'Contact'} — ${contact.company || 'N/A'}</p>
          <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
            ${contact.phone ? `<p style="margin:0;"><b>📞</b> ${contact.phone}</p>` : ''}
            ${contact.email ? `<p style="margin:0;"><b>✉️</b> ${contact.email}</p>` : ''}
            ${contact.address ? `<p style="margin:0; font-size: 10px; color: #94a3b8;"><b>📍</b> ${contact.address}</p>` : ''}
          </div>
        </div>
      `;

      const marker = window.L.marker([contact.lat, contact.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-leaflet-popup'
        });

      markersRef.current[contact.id || contact.row_id || contact.name] = marker;
    });

    // Auto fit bounds if markers exist
    if (geocodedContacts.length > 0) {
      const group = new window.L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [geocodedContacts]);

  // Focus Map on contact location
  const handleFocusContact = (contact) => {
    if (!mapInstance.current || !contact.lat || !contact.lng) return;

    const map = mapInstance.current;
    map.flyTo([contact.lat, contact.lng], 12, {
      animate: true,
      duration: 1.5
    });

    const marker = markersRef.current[contact.id || contact.row_id || contact.name];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 1500);
    }
  };

  const filteredContacts = geocodedContacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Sci-Fi Title Panel */}
      <div className="cyber-panel-glow rounded-3xl p-6 sm:p-8 hud-corner relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase mb-1">
              <Compass className="w-3 h-3 text-cyan-400" /> Neural Geolocation Grid
            </div>
            <h1 className="text-2xl font-extrabold text-white font-heading tracking-tight">
              Network Geo-Matrix Map
            </h1>
            <p className="text-xs text-slate-400">Track and visualize the geographic density and physical distribution of your scanned network.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Split Pane List vs Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Stats and Contacts Index */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Geolocation Stats widget */}
          <div className="cyber-card rounded-2xl p-5 space-y-4 hud-corner">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span>MATRIX GEOMETRICS</span>
              <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
            </h3>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-400 font-mono block">MAPPED NODES</span>
                <span className="text-2xl font-extrabold text-glow-cyan text-cyan-300 font-mono mt-0.5 block">{stats.total}</span>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-400 font-mono block">CORE CITY HUB</span>
                <span className="text-md font-bold text-white truncate block mt-1.5">{stats.topCity}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60 leading-normal flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Addresses are parsed and resolved via OpenStreetMap geocoding. Exact overlapping points in the same city are slightly randomized (jittered) to allow individual selections.</span>
            </div>
          </div>

          {/* Searchable Contact Geo-List */}
          <div className="cyber-card rounded-2xl p-5 flex-1 flex flex-col min-h-[350px] max-h-[500px] hud-corner">
            <div className="space-y-3 pb-3 border-b border-slate-900">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>NODE SEARCH</span>
                <Users className="w-4 h-4 text-slate-500" />
              </h3>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter mapped nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition font-sans"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2 pr-1.5 scrollbar-thin">
              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-mono text-cyan-400/80 animate-pulse">Resolving location matrices...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-xs font-mono">
                  No mapped coordinates match search query.
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div 
                    key={contact.id || contact.row_id || contact.name}
                    className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-cyan-500/30 rounded-xl transition flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 leading-tight">
                      <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">{contact.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{contact.company || 'N/A'}</p>
                      
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-cyan-400 font-mono">
                        <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{contact.address}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFocusContact(contact)}
                      className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-black text-[10px] font-mono font-bold rounded-lg border border-cyan-500/20 transition cursor-pointer shrink-0"
                    >
                      Focus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Leaflet Interactive Map Container */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-[500px] lg:h-auto min-h-[450px]">
          {/* The Leaflet Div Container */}
          <div ref={mapRef} className="w-full h-full z-10 bg-slate-950"></div>

          {/* High-tech border overlays */}
          <div className="absolute top-4 left-4 z-20 bg-slate-950/80 border border-cyan-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg pointer-events-none">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              LIVE GEO-MATRIX MATRIX ACTIVE
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
