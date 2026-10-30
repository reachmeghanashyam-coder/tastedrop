// lib/catalog.ts
export interface ProductSKU {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewsCount: number;
  isPrime: boolean;
  image: string;
  editorialNote: string;
  qlooTag: string;
  qlooAffinity: number; // 0 to 100
  isUtilitySlop?: boolean;
}

export interface ScenarioData {
  id: string;
  name: string;
  categoryName: string;
  anchorProduct: {
    id: string;
    title: string;
    subtitle: string;
    price: number;
    rating: number;
    reviewsCount: number;
    isPrime: boolean;
    image: string;
    description: string;
    qlooEntityQuery: string;
    expectedEntityId: string;
  };
  // What traditional "Frequently Bought Together" recommenders show (Utility Slop)
  baselineAccessories: ProductSKU[];
  // What TasteDrop recommends by querying Qloo's cultural taste graph
  tasteDropCompanions: {
    prePurchase: ProductSKU[]; // 2 items in cart drawer
    postPurchase: ProductSKU;   // 1 item in post-purchase confirmation
  };
}

export const SCENARIOS: Record<string, ScenarioData> = {
  home_decor: {
    id: "home_decor",
    name: "Architectural Living",
    categoryName: "Home & Design",
    anchorProduct: {
      id: "prod_noguchi_table",
      title: "Noguchi Sculptural Solid Walnut Center Table",
      subtitle: "19mm Beveled Tempered Glass Top · Hand-Finished Walnut Base",
      price: 450.00,
      rating: 4.9,
      reviewsCount: 1428,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=80",
      description: "An organic triumph of balance and sculptural grace, uniting biomorphic wood craftsmanship with heavy tempered glass.",
      qlooEntityQuery: "Noguchi Table",
      expectedEntityId: "ent_noguchi_design_881"
    },
    baselineAccessories: [
      {
        id: "base_table_cloth",
        title: "Crystal Clear Heavy-Duty PVC Vinyl Tablecloth Protector (60 x 120 Inch)",
        category: "Cleaning & Maintenance",
        price: 14.99,
        rating: 4.1,
        reviewsCount: 3120,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Standard algorithmic co-occurrence recommendation.",
        qlooTag: "utility_protection",
        qlooAffinity: 12,
        isUtilitySlop: true
      },
      {
        id: "base_wood_polish",
        title: "Feed-N-Wax Wood Polish & Beeswax Conditioner (16 oz)",
        category: "Cleaning & Maintenance",
        price: 9.50,
        rating: 4.5,
        reviewsCount: 8940,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Standard algorithmic maintenance cross-sell.",
        qlooTag: "utility_cleaning",
        qlooAffinity: 18,
        isUtilitySlop: true
      },
      {
        id: "base_felt_pads",
        title: "Heavy Duty Adhesive Felt Furniture Pads for Hardwood Floors (136 Pack)",
        category: "Hardware Accessories",
        price: 7.99,
        rating: 4.4,
        reviewsCount: 6510,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Standard algorithmic floor protector suggestion.",
        qlooTag: "utility_hardware",
        qlooAffinity: 15,
        isUtilitySlop: true
      }
    ],
    tasteDropCompanions: {
      prePurchase: [
        {
          id: "td_skeleton_ashtray",
          title: "Cast-Iron Brutalist Skeleton Tray & Valet Dish",
          category: "Artisanal Home Objects",
          price: 34.00,
          originalPrice: 48.00,
          discountBadge: "Prime Deal · Save 29%",
          rating: 4.9,
          reviewsCount: 342,
          isPrime: true,
          image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
          editorialNote: "Raw forged cast iron complements the dark sculptural walnut base.",
          qlooTag: "brutalist_decor",
          qlooAffinity: 93
        },
        {
          id: "td_taschen_book",
          title: "Taschen: Brutalism in Architecture & Modern Spatial Design",
          category: "Design & Art Monographs",
          price: 42.00,
          originalPrice: 50.00,
          discountBadge: "Top Cultural Trend",
          rating: 4.8,
          reviewsCount: 914,
          isPrime: true,
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
          editorialNote: "The authoritative visual companion for modernist living spaces.",
          qlooTag: "architectural_monograph",
          qlooAffinity: 89
        }
      ],
      postPurchase: {
        id: "td_hinoki_incense",
        title: "Nippon Kodo Kayuragi Hinoki & Smoked Cedarwood Japanese Incense",
        category: "Olfactory Sensory",
        price: 22.00,
        originalPrice: 28.00,
        discountBadge: "Limited Batch",
        rating: 4.9,
        reviewsCount: 1820,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Natural Kyoto hinoki cypress fragrance to ground the living room atmosphere.",
        qlooTag: "japanese_minimalism_sensory",
        qlooAffinity: 86
      }
    }
  },

  fashion_heritage: {
    id: "fashion_heritage",
    name: "Heritage Outerwear",
    categoryName: "Apparel & Lifestyle",
    anchorProduct: {
      id: "prod_schott_jacket",
      title: "Schott NYC 618 Motorcycle Jacket",
      subtitle: "Full-Grain Steerhide · Asymmetrical Zipper · Quilted Satin Lining",
      price: 650.00,
      rating: 4.9,
      reviewsCount: 2180,
      isPrime: true,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
      description: "The original American double-rider jacket. Worn by legends, cut from heavy naked steerhide that develops an irreplaceable patina with age.",
      qlooEntityQuery: "Schott NYC 618 Leather",
      expectedEntityId: "ent_schott_nyc_772"
    },
    baselineAccessories: [
      {
        id: "base_leather_cream",
        title: "Bickmore Bick 4 Leather Conditioner & Restorer (8 oz)",
        category: "Shoe & Leather Care",
        price: 12.00,
        rating: 4.6,
        reviewsCount: 7820,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Standard algorithmic leather care accessory.",
        qlooTag: "utility_leather_care",
        qlooAffinity: 19,
        isUtilitySlop: true
      },
      {
        id: "base_cedar_hangers",
        title: "Solid Natural Red Cedar Wood Heavy Duty Coat Hangers (6 Pack)",
        category: "Closet Storage",
        price: 18.00,
        rating: 4.4,
        reviewsCount: 4210,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Standard closet storage cross-sell.",
        qlooTag: "utility_storage",
        qlooAffinity: 14,
        isUtilitySlop: true
      }
    ],
    tasteDropCompanions: {
      prePurchase: [
        {
          id: "td_jazz_club",
          title: "Maison Margiela REPLICA 'Jazz Club' Eau de Toilette (Travel Spray)",
          category: "Artisanal Fragrance",
          price: 38.00,
          originalPrice: 45.00,
          discountBadge: "Curated Companion",
          rating: 4.8,
          reviewsCount: 1650,
          isPrime: true,
          image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
          editorialNote: "Smoky rum and tobacco leaf accords that pair with vintage leather.",
          qlooTag: "niche_fragrance_subculture",
          qlooAffinity: 91
        },
        {
          id: "td_stooges_vinyl",
          title: "The Stooges: 'Raw Power' (David Bowie Mix) 180g Audiophile Vinyl",
          category: "Rare & Heritage Vinyl",
          price: 28.00,
          originalPrice: 35.00,
          discountBadge: "Cultural Anchor",
          rating: 4.9,
          reviewsCount: 880,
          isPrime: true,
          image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
          editorialNote: "The seminal proto-punk record that soundtracked 1970s motorcycle culture.",
          qlooTag: "garage_proto_punk",
          qlooAffinity: 88
        }
      ],
      postPurchase: {
        id: "td_chup_socks",
        title: "Chup: Handcrafted Japanese Wool Beanie",
        category: "Japanese Craft",
        price: 32.00,
        originalPrice: 42.00,
        discountBadge: "Save 24%",
        rating: 4.9,
        reviewsCount: 410,
        isPrime: true,
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80",
        editorialNote: "Tokyo loom-knit wool.",
        qlooTag: "tokyo_craft_heritage",
        qlooAffinity: 85
      }
    }
  }
};
