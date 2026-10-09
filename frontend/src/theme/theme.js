import {
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": {
  margin: 0,
  padding: 0,
  fontFamily: "body",
  backgroundColor: "khaki.50",
  color: "charcoal.800",
  scrollBehavior: "smooth",
},

html: {
  scrollBehavior: "smooth",
  scrollPaddingTop: "90px",
},

    body: {
      minHeight: "100vh",
    },

    "*": {
      boxSizing: "border-box",
    },

    "::selection": {
      backgroundColor: "gold.200",
      color: "brand.900",
    },
  },

  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#F5F7F2" },
          100: { value: "#E7ECDF" },
          200: { value: "#CCD7BF" },
          300: { value: "#A9B996" },
          400: { value: "#81966E" },
          500: { value: "#526B48" },
          600: { value: "#3D5636" },
          700: { value: "#30452B" },
          800: { value: "#243520" },
          900: { value: "#172419" },
        },

        gold: {
          50: { value: "#FFF9E8" },
          100: { value: "#FCEFC5" },
          200: { value: "#F5DEA0" },
          300: { value: "#EBCB70" },
          400: { value: "#DDB44D" },
          500: { value: "#C89A32" },
          600: { value: "#A97D21" },
          700: { value: "#825F19" },
          800: { value: "#604713" },
          900: { value: "#3E2F0D" },
        },

        khaki: {
          50: { value: "#FAF8F0" },
          100: { value: "#F3F0E3" },
          200: { value: "#E7E1CC" },
          300: { value: "#D8CFB2" },
          400: { value: "#C7BA94" },
          500: { value: "#B2A276" },
          600: { value: "#95865E" },
          700: { value: "#756946" },
          800: { value: "#554D35" },
          900: { value: "#373225" },
        },

        charcoal: {
          50: { value: "#F5F5F4" },
          100: { value: "#E7E7E5" },
          200: { value: "#D1D1CD" },
          300: { value: "#AFAFA9" },
          400: { value: "#85857E" },
          500: { value: "#62625C" },
          600: { value: "#4A4A45" },
          700: { value: "#373733" },
          800: { value: "#242421" },
          900: { value: "#151513" },
        },
      },

      fonts: {
        heading: {
          value: "'Inter', 'Segoe UI', sans-serif",
        },
        body: {
          value: "'Inter', 'Segoe UI', sans-serif",
        },
      },

      radii: {
        sm: { value: "6px" },
        md: { value: "8px" },
        lg: { value: "14px" },
        xl: { value: "20px" },
      },

      shadows: {
        sm: {
          value: "0 2px 8px rgba(36, 53, 32, 0.06)",
        },
        md: {
          value: "0 8px 24px rgba(36, 53, 32, 0.10)",
        },
        lg: {
          value: "0 16px 40px rgba(36, 53, 32, 0.14)",
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;