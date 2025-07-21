import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: {
      main: '#3f51b5',  
    },
    secondary: {
      main: '#f50057',  
    },
    // You can add custom colors, shades of black/white, etc.
  },
  typography: {
    // customize fonts, sizes, weights if you want
  },
  spacing: 8, // base spacing unit
});

export default theme;