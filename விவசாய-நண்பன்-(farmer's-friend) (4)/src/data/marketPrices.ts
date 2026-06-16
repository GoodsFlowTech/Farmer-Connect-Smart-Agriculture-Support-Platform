export interface MarketPrice {
  id: string;
  commodity: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  change: number; // percentage
  history?: { date: string, price: number }[];
}

export interface RegionPrices {
  region: string;
  prices: MarketPrice[];
}

export const MARKET_DATA: RegionPrices[] = [
  {
    region: "ஈரோடு (Erode)",
    prices: [
      { 
        id: "e1", commodity: "மஞ்சள் (Turmeric)", market: "ஈரோடு சந்து", minPrice: 8500, maxPrice: 9200, modalPrice: 8850, unit: "குவிண்டால்", change: 2.5,
        history: [
          { date: "ஏப் 15", price: 8600 },
          { date: "ஏப் 16", price: 8700 },
          { date: "ஏப் 17", price: 8650 },
          { date: "ஏப் 18", price: 8750 },
          { date: "ஏப் 19", price: 8800 },
          { date: "இன்று", price: 8850 }
        ]
      },
      { 
        id: "e2", commodity: "நெல் (Paddy)", market: "ஈரோடு", minPrice: 2100, maxPrice: 2350, modalPrice: 2200, unit: "குவிண்டால்", change: -1.2,
        history: [
          { date: "ஏப் 15", price: 2250 },
          { date: "ஏப் 16", price: 2240 },
          { date: "ஏப் 17", price: 2230 },
          { date: "ஏப் 18", price: 2220 },
          { date: "ஏப் 19", price: 2210 },
          { date: "இன்று", price: 2200 }
        ]
      },
      { id: "e3", commodity: "தேங்காய் (Coconut)", market: "பெருந்துறை", minPrice: 12, maxPrice: 15, modalPrice: 13, unit: "ஒன்று", change: 5.0 },
    ]
  },
  {
    region: "மதுரை (Madurai)",
    prices: [
      { id: "m1", commodity: "மல்லிகை (Jasmine)", market: "மதுரை மாட்டுத்தாவணி", minPrice: 400, maxPrice: 800, modalPrice: 600, unit: "கி.கி", change: 15.0 },
      { id: "m2", commodity: "தக்காளி (Tomato)", market: "மதுரை", minPrice: 1500, maxPrice: 2200, modalPrice: 1800, unit: "பெட்டி (25kg)", change: -8.5 },
      { id: "m3", commodity: "வெங்காயம் (Onion)", market: "மதுரை", minPrice: 2500, maxPrice: 3200, modalPrice: 2800, unit: "குவிண்டால்", change: 3.2 },
    ]
  },
  {
    region: "திருச்சி (Trichy)",
    prices: [
      { id: "t1", commodity: "வாழை (Banana)", market: "காந்தி மார்க்கெட்", minPrice: 300, maxPrice: 500, modalPrice: 400, unit: "தார்", change: 0.0 },
      { id: "t2", commodity: "நெல் (Paddy)", market: "திருச்சி", minPrice: 2050, maxPrice: 2300, modalPrice: 2180, unit: "குவிண்டால்", change: 1.5 },
      { id: "t3", commodity: "சின்ன வெங்காயம் (Small Onion)", market: "திருச்சி", minPrice: 4000, maxPrice: 5500, modalPrice: 4800, unit: "குவிண்டால்", change: 12.4 },
    ]
  },
  {
    region: "சேலம் (Salem)",
    prices: [
      { id: "s1", commodity: "மாம்பழம் (Mango)", market: "சேலம்", minPrice: 50, maxPrice: 120, modalPrice: 80, unit: "கி.கி", change: -2.1 },
      { id: "s2", commodity: "மரவள்ளிக்கிழங்கு (Tapioca)", market: "நாமக்கல்/சேலம்", minPrice: 8000, maxPrice: 10000, modalPrice: 9000, unit: "டன்", change: 4.8 },
      { id: "s3", commodity: "காபி (Coffee)", market: "ஏற்காடு", minPrice: 150, maxPrice: 250, modalPrice: 200, unit: "கி.கி", change: 0.5 },
    ]
  }
];
