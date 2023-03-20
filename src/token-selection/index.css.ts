import { Styles } from "@ijstech/components";
const Theme = Styles.Theme.ThemeVars;

export const scrollbarStyle = Styles.style({
  $nest: {
    '&::-webkit-scrollbar-track': {
      borderRadius: '12px',
      border: '1px solid transparent',
      backgroundColor: 'unset'
    },
    '&::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: 'unset'
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '12px',
      background: '#d3d3d3 0% 0% no-repeat padding-box'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#bababa 0% 0% no-repeat padding-box'
    }
  }
})

export const buttonStyle = Styles.style({
  boxShadow: 'none'
})

export const tokenStyle = Styles.style({
  $nest: {
    '&:hover': {
      background: Theme.action.hover
    }
  }
})

export const modalStyle = Styles.style({
  $nest: {
    '.modal': {
      padding: 0,
      paddingBottom: '1rem',
      borderRadius: 8
    }
  }
})